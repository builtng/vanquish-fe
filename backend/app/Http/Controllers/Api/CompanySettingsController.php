<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CompanySettingsController extends Controller
{
    /**
     * Get all company settings as a key => value map.
     * Public: returns only non-sensitive settings.
     */
    public function index()
    {
        $rows = DB::table('company_settings')->get();
        $map  = [];
        foreach ($rows as $row) {
            $map[$row->key] = $row->value;
        }

        // Add Base64 versions for PDF generation (bypasses CORS issues)
        foreach (['platform_logo_url' => 'platform_logo_base64', 'platform_logo_dark_url' => 'platform_logo_dark_base64'] as $urlKey => $base64Key) {
            if (!empty($map[$urlKey])) {
                $map[$base64Key] = $this->getBase64FromUrl($map[$urlKey]);
            }
        }

        return response()->json($map);
    }

    /**
     * Update one or more company settings (admin only).
     */
    public function update(Request $request)
    {
        $allowed = [
            'company_name', 'company_tagline', 'company_email',
            'company_phone', 'company_address', 'company_website',
            'pdf_header_text', 'pdf_footer_text',
        ];

        $data = $request->validate([
            'company_name'    => 'sometimes|string|max:200',
            'company_tagline' => 'sometimes|string|max:300',
            'company_email'   => 'sometimes|email|max:200|nullable',
            'company_phone'   => 'sometimes|string|max:50|nullable',
            'company_address' => 'sometimes|string|max:500|nullable',
            'company_website' => 'sometimes|url|max:300|nullable',
            'pdf_header_text' => 'sometimes|string|max:300',
            'pdf_footer_text' => 'sometimes|string|max:300',
        ]);

        foreach ($data as $key => $value) {
            DB::table('company_settings')
                ->updateOrInsert(
                    ['key' => $key],
                    ['value' => $value, 'updated_at' => now()]
                );
        }

        return response()->json(['message' => 'Settings updated', 'settings' => $this->getMap()]);
    }

    /**
     * Upload platform logo (admin only).
     * Accepts 'logo' (light) or 'logo_dark'.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo'      => 'sometimes|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'logo_dark' => 'sometimes|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ]);

        $updated = [];

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            $old = DB::table('company_settings')->where('key', 'platform_logo_url')->value('value');
            if ($old) $this->deleteOldLogo($old);

            $path = $request->file('logo')->store('company', 'public');
            $url  = asset('storage/' . $path);

            DB::table('company_settings')->updateOrInsert(
                ['key' => 'platform_logo_url'],
                ['value' => $url, 'updated_at' => now()]
            );
            $updated['platform_logo_url'] = $url;
        }

        if ($request->hasFile('logo_dark')) {
            $old = DB::table('company_settings')->where('key', 'platform_logo_dark_url')->value('value');
            if ($old) $this->deleteOldLogo($old);

            $path = $request->file('logo_dark')->store('company', 'public');
            $url  = asset('storage/' . $path);

            DB::table('company_settings')->updateOrInsert(
                ['key' => 'platform_logo_dark_url'],
                ['value' => $url, 'updated_at' => now()]
            );
            $updated['platform_logo_dark_url'] = $url;
        }

        return response()->json(['message' => 'Logo uploaded', 'urls' => $updated]);
    }

    /**
     * Delete a logo (admin only).
     */
    public function deleteLogo(Request $request)
    {
        $request->validate(['type' => 'required|in:logo,logo_dark']);

        $key = $request->type === 'logo' ? 'platform_logo_url' : 'platform_logo_dark_url';
        $url = DB::table('company_settings')->where('key', $key)->value('value');

        if ($url) {
            $this->deleteOldLogo($url);
            DB::table('company_settings')
                ->where('key', $key)
                ->update(['value' => '', 'updated_at' => now()]);
        }

        return response()->json(['message' => 'Logo removed']);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function getMap(): array
    {
        $rows = DB::table('company_settings')->get();
        $map  = [];
        foreach ($rows as $row) {
            $map[$row->key] = $row->value;
        }

        // Add Base64 versions
        foreach (['platform_logo_url' => 'platform_logo_base64', 'platform_logo_dark_url' => 'platform_logo_dark_base64'] as $urlKey => $base64Key) {
            if (!empty($map[$urlKey])) {
                $map[$base64Key] = $this->getBase64FromUrl($map[$urlKey]);
            }
        }

        return $map;
    }

    private function deleteOldLogo(string $url): void
    {
        try {
            // Convert URL back to storage path
            $storageBase = asset('storage/');
            if (str_starts_with($url, $storageBase)) {
                $relativePath = str_replace($storageBase, '', $url);
                Storage::disk('public')->delete($relativePath);
            }
        } catch (\Throwable) {
            // Silently ignore — old file may not exist
        }
    }

    private function getBase64FromUrl(string $url): ?string
    {
        try {
            $storageBase = asset('storage/');
            if (str_starts_with($url, $storageBase)) {
                $relativePath = str_replace($storageBase, '', $url);
                if (Storage::disk('public')->exists($relativePath)) {
                    $content = Storage::disk('public')->get($relativePath);
                    $mime = Storage::disk('public')->mimeType($relativePath);
                    return 'data:' . $mime . ';base64,' . base64_encode($content);
                }
            }
        } catch (\Throwable) {
            return null;
        }
        return null;
    }
}
