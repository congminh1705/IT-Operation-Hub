"use client";

export type FieldIssue = { fieldId: string; message: string };

export function focusFirstInvalid(form: HTMLFormElement): boolean {
  const field = form.querySelector<HTMLElement>(
    '[aria-invalid="true"]:not(:disabled)',
  );
  field?.focus();
  return !!field;
}

export function FormErrors({ errors }: { errors: readonly FieldIssue[] }) {
  if (!errors.length) return null;
  return (
    <div className="ui-form-errors" role="alert">
      <p>Kiểm tra thông tin trước khi gửi.</p>
      <ul>
        {errors.map(({ fieldId, message }) => (
          <li key={fieldId}>
            <a
              href={`#${fieldId}`}
              onClick={(event) => {
                const target = document.getElementById(fieldId);
                if (target) {
                  event.preventDefault();
                  target.focus();
                }
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
