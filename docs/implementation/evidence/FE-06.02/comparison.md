# FE-06.02 — Public replies and internal notes

Agent compared the public composer at 1440 × 1000 and 390 × 1000 with reduced motion. PO joint review pending.

| Role | Desktop | Mobile |
| --- | --- | --- |
| Technician | [HTML](reference-ticket-it-1440.png) / [App](actual-ticket-it-1440.png) | [HTML](reference-ticket-it-390.png) / [App](actual-ticket-it-390.png) |
| Requester | [HTML](reference-ticket-requester-1440.png) / [App](actual-ticket-requester-1440.png) | [HTML](reference-ticket-requester-390.png) / [App](actual-ticket-requester-390.png) |

The form sits under the conversation. Both views use the approved public textarea and teal preview action. The app uses separate in-memory drafts and audience labels, and provides inline preview, edit and confirmation. The technician snapshot uses a Pending fixture rather than the reference's In Progress fixture, with the same public composer. Mobile audience controls wrap. Attachments and AI links are outside this task. Existing local toolbar edits may appear in captures and are outside this commit.

The [Chromium log](chromium.log) covers isolated drafts, internal note submission, first response only after public IT confirmation, Pending requester reply and revocation during confirmation. The latter hides detail and makes the submitted draft available to copy.

## PO steps

- As Technician open /tickets/TKT-000126 and draft a public message and internal note separately. Preview and send the note, then confirm that the first-response indicator appears only after confirming the public reply.
- As Requester open /tickets/TKT-000128 and reply. Confirm the Pending banner clears after successful submission and history records resumption.
- As Technician repeat an internal note on /tickets/TKT-000128?demo=reply-revoked and verify the draft is retained while the detail is hidden.
