"use client";
import React from "react";

/**
 * Verbatim agreement clause text for the internal (non-Jotform) service
 * agreement pages, sourced directly from Vanquish Therapies' own
 * "VQT Agreement - LCC.pdf" (low-cost) client agreement document.
 * Mirrored server-side in resources/views/pdf/client-agreement.blade.php
 * for the downloadable PDF copy — keep both in sync if this text changes.
 *
 * NOTE: the mid-range variant below is still a best-effort placeholder
 * pending the actual mid-range agreement source document.
 */
export default function AgreementClauses({ variant }) {
  const isLowCost = variant === "low-cost";

  const Clause = ({ label, children }) => (
    <p className="mb-4">
      {label && <strong style={{ color: "var(--text-primary)" }}>{label}: </strong>}
      {children}
    </p>
  );

  return (
    <div
      className="max-h-[28rem] overflow-y-auto p-5 rounded-lg border text-left text-sm leading-relaxed"
      style={{
        borderColor: "var(--border-color)",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-secondary)",
      }}
    >
      <h4
        className="text-base font-bold mb-4 text-center"
        style={{ color: "var(--text-primary)" }}
      >
        PLEASE READ THIS CONTRACT CAREFULLY
      </h4>

      <Clause>
        Agreement between (Full legal name, as entered above) (referred to as
        &ldquo;you&rdquo;, &ldquo;your&rdquo; and &ldquo;client/clients&rdquo;) and{" "}
        <strong>Vanquish Therapies</strong> (VQT). (Your assigned Trainee
        Counsellor/Coach will contract with you verbally).
      </Clause>

      <Clause>
        <strong>Vanquish Therapies</strong> will provide you with a
        confidential, safe space to explore personal and relational issues
        and support you through the process without judgement. During your
        sessions, goals will be agreed, and you (the client) agrees to work
        towards them. If at any time the Trainee Counsellor/Coach or Client
        feels they can no longer have a therapeutic relationship for any
        reason, <strong>Vanquish Therapies</strong> will, where possible,
        offer to refer the client to an alternative Trainee Counsellor/Coach,
        depending on availability.
      </Clause>

      <Clause label="Consent">
        Are you willing to be part of an anonymised written case study? (This
        is a requirement for Trainee Counsellors/Coaches). Please be assured
        there will be no identifiable information in the case study that
        will identify you. Under no circumstances will your sessions be
        audio or video recorded. Please select &ldquo;Yes&rdquo; below if you
        would like to give consent, if not, please select &ldquo;No&rdquo;.
      </Clause>

      <Clause label="Confidentiality">
        <strong>Vanquish Therapies</strong> has a legal, professional, and
        ethical obligation to do all we can to protect your confidentiality.
        We are bound by the ethical standards of the National Counselling and
        Psychotherapy Society (NCPS), The British Association for Counselling
        &amp; Psychotherapy (BACP), and Association For Coaching. This means
        that information provided by you (the client) to our staff members,
        Counsellors, Trainee Counsellors, Coaches, and to anyone else acting
        on behalf of <strong>Vanquish Therapies</strong>, will not be shared
        outside of our organisation, unless we are legally or professionally
        required to do so. <strong>Vanquish Therapies</strong> will never
        share information about our client for commercial or personal gain
        however, on rare occasions, breaking confidentiality might be
        necessary to protect everyone from serious harm or to comply with the
        law. Please contact us to read our Confidentiality Policy.
      </Clause>

      <Clause label="Sessions">
        Our Counsellors/Coaches offer you a commitment and reserve your
        weekly session and will not allocate this time to anyone else. For
        this reason, we ask you to commit to attending weekly sessions. We
        cannot offer sessions fortnightly, monthly or intermittently, and we
        cannot offer extended or repeated breaks during your therapeutic
        contract.
      </Clause>

      <Clause label="Counselling">
        The sessions with your assigned Counsellor will be capped at a
        maximum of <strong>50 Sessions/hours</strong>. This includes all
        scheduled sessions (whether attended, missed, or cancelled).
      </Clause>

      <Clause label="Coaching">
        The sessions with your assigned Coach will be capped at a maximum of{" "}
        <strong>24 sessions/hours</strong>. This includes all scheduled
        sessions (whether attended, missed, or cancelled).
      </Clause>

      <Clause>
        Upon completion of the allocated hours, there may be an opportunity
        to continue with further sessions, this may involve working with a
        different counsellor or coach. Sessions will be conducted online via
        Zoom. The client is required to provide their first name or an
        agreed-upon alternative name prior (during the consultation, email or
        WhatsApp) when joining the online sessions. If the Client does not
        adhere to this requirement, the session will not proceed.
      </Clause>

      <Clause label="Bookings & Payments">
        Sessions must be booked <strong>at least 48 hours</strong> in
        advance; after this time, the booking system will automatically
        close your slot for that week. Sessions must be booked in blocks of
        four. This helps ensure your assigned therapeutic space is secured
        with your assigned counsellor/coach even if you are unable to attend
        a session.
      </Clause>

      <Clause>
        If sessions are missed, creating a gap, for example, if you finish
        one block and you miss a week before booking another block, any new
        payment made will first be applied to cover that gap in order to
        maintain your therapeutic space. Any extended gaps or a lack of
        continuity without prior communication will result in your space
        being reassigned at the discretion of management.
      </Clause>

      <Clause label="Rescheduling">
        Sessions <strong>cannot</strong> be rescheduled within the low-cost
        service. If you are unable to attend a scheduled session, regardless
        of reason(s), it will be cancelled. No refunds or session credits
        will be provided for missed/cancelled sessions. If due to any reason
        your Counsellor/Coach has to cancel a session,{" "}
        <strong>Vanquish Therapies</strong> will aim to give you{" "}
        <strong>48-hours notice</strong> and will reschedule your session
        free of charge. We strongly encourage you to read our Booking,
        Rescheduling, &amp; Cancellation Policy.
      </Clause>

      <Clause label="Cancellation of Service">
        If you do not wish to continue using our services and want to cancel
        any scheduled sessions, you can do so up to{" "}
        <strong>48 hours prior</strong> to the scheduled session. The
        48-hour notice must be given during our administrative and
        operational hours, Monday&ndash;Friday from 9am&ndash;5pm (UK Time).
        For sessions scheduled on a Monday or Tuesday, notice must be given
        by 5pm (UK Time) on the preceding Friday. Cancelled Sessions within
        this 48-hour window will be refunded the payment made. Cancellations
        made after this period will not be refunded.
      </Clause>

      <Clause label="Technical Issues">
        Should there be any technical issues on the client&rsquo;s end (e.g.,
        poor internet connection) the Counsellor/Coach will wait for you on
        Zoom for <strong>15 minutes</strong>, after which they will leave as
        there will not be enough time to conduct an effective session. The
        session will still be counted and cannot be
        rescheduled/refunded or credited. In case of any technical issues
        caused on the Counsellors/Coaches end,{" "}
        <strong>Vanquish Therapies</strong> will reschedule your session free
        of charge. In these situations, you will be contacted by the Support
        Coordinators.
      </Clause>

      <Clause>
        Please be aware: Sessions will <strong>not</strong> proceed if the
        cameras are <strong>turned off</strong>. If, for any reason, you are
        unable to use your camera, your counsellor/coach will not move
        forward with the session, and you will not be able to reschedule
        this session. No refunds or session credits will be provided.
      </Clause>

      <Clause label="Communications">
        Clients will <strong>not</strong> communicate with their assigned
        Trainee Counsellor/Coach outside of the session. For bookings,
        rescheduling, cancellations, or general enquiries, the client will
        contact <strong>Vanquish Therapies</strong> via email or WhatsApp.
        Please note &ndash; VQT and online Counselling/Coaching are{" "}
        <strong>not</strong> a crisis or emergency service. If you need to
        speak to someone immediately, please contact your{" "}
        <strong>GP</strong>, <strong>NHS (111)</strong>, or the{" "}
        <strong>Samaritans (116 123)</strong>.
      </Clause>

      <Clause label="Termination of service">
        We understand that your life circumstances may suddenly change. You
        may at any point desire or be obligated to discontinue
        therapy/coaching. Whatever the reason, we respect your decision and
        ask that you give your Counsellor/Coach as much notice as possible
        to have a closing session.
      </Clause>

      <Clause label="Complaints">
        If for any reason you are unhappy with the service you have received
        or dissatisfied with your assigned Counsellor/Coach, please contact{" "}
        <strong>Vanquish Therapies</strong> via email. The Support
        Coordinators will arrange a discussion between you and one of our
        Managers to address and resolve the issues. Failing this, you will
        receive guidance on how to proceed with the complaint&rsquo;s
        procedure.
      </Clause>

      <p className="mb-4 italic">
        This agreement shall be construed and governed in all respects in
        accordance with the laws of England and any dispute or differences in
        relation to this agreement shall be subject to the exclusive
        jurisdiction of the English Courts.
      </p>

      <p className="mb-4 font-semibold" style={{ color: "var(--text-primary)" }}>
        This contract is intended to explain the practicalities of the
        Therapeutic agreement. Please read it carefully before signing below.
        In signing, you are agreeing to the above terms and conditions and
        the related policies (which include the provision for breach of
        confidentiality in those rare circumstances described above).
      </p>

      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
        I agree to adhere to all the policies and procedures set forth by
        Vanquish Therapies, including the prohibition against recording any
        sessions.
      </p>
    </div>
  );
}
