<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SharedDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SharedDocumentController extends Controller
{
    public function index()
    {
        $documents = SharedDocument::where('is_active', true)
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // 10MB limit
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $this->formatBytes($file->getSize());
        $fileType = strtoupper($file->getClientOriginalExtension());
        
        $path = $file->store('shared_documents', 'public');

        $document = SharedDocument::create([
            'name' => $request->name,
            'description' => $request->description,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($document, 201);
    }

    public function destroy(SharedDocument $document)
    {
        Storage::disk('public')->delete($document->file_path);
        $document->delete();
        
        return response()->json(['message' => 'Document deleted successfully']);
    }

    /**
     * Download the file.
     */
    public function download(SharedDocument $document)
    {
        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->name . '.' . pathinfo($document->file_path, PATHINFO_EXTENSION));
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
