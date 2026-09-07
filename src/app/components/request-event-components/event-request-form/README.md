# Event request form

- `event-request.models.ts`: client/event entity types and the local review draft. Keep these aligned with the Java classes.
- `event-request.form.ts`: typed controls and validation. Add or change controls here.
- `event-request-form.html`: explicit client and event markup. Edit the relevant field directly; there is no generic field-rendering schema.
- `event-request-form.ts`: menu resource, ID-based selection, and review state. Menu HTTP calls remain in `MenuService`.
- `event-request-form.scss`: component styles under the `request-layout` BEM block, with two-space indentation.

When adding a field, update its model, form control, template, and review display. The client and event groups map directly to their entity fields. `status` defaults to `REQUESTED`; IDs are not user inputs.

The `request` getter returns a local review draft, not a backend POST contract. When submission endpoints are available, put orchestration in a service: create the client, use its returned ID for `Event.clientId`, and send selected menu IDs according to the backend relationship contract. Do not add cuisine or menu fields to the Event entity without a matching backend change.

Cuisine filtering uses the existing `/api/menu?cuisineType=...` endpoint. The UI label Mixed maps to `GENERAL`. `selectedMenu` stores only numeric IDs. A separate private metadata map supplies `selectedDishes` for display, preserving names and prices across cuisine changes and failed requests. The draft copies the selected IDs directly. Prices currently display in GEL; change the currency bindings if the backend uses another currency.

`menuLoading` and `menuError` derive from the resource. Loading hides dish actions; network, access, and server failures show user-facing messages with a retry action. These states do not clear the form or selected IDs. Keep raw backend error details out of the UI.

Focused checks:

```sh
node node_modules/@angular/cli/bin/ng.js test --watch=false --include='**/event-request-form.spec.ts' --include='**/request-event.spec.ts' --include='**/menu-service.spec.ts'
node node_modules/@angular/cli/bin/ng.js build
```
