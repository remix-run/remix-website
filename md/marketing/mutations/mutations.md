:::

```tsx
export default function NewInvoice() {
  return (
    <Form method="post">
      <input type="text" name="company" />
      <input type="text" name="amount" />
      <button type="submit">Create</button>
    </Form>
  );
}
```

---

```tsx [11-15]
export default function NewInvoice() {
  return (
    <Form method="post">
      <input type="text" name="company" />
      <input type="text" name="amount" />
      <button type="submit">Create</button>
    </Form>
  );
}

export async function action({ request }) {
  let body = await request.formData();
  let invoice = await createInvoice(body);
  return redirect(`/invoices/${invoice.id}`);
}
```

---

```tsx [2,8-10]
export default function NewInvoice() {
  let transition = useTransition();
  return (
    <Form method="post">
      <input type="text" name="company" />
      <input type="text" name="amount" />
      <button type="submit">
        {transition.state === "submitting"
          ? "Creating invoice..."
          : "Create invoice"}
      </button>
    </Form>
  );
}
```

---

```tsx [3-9]
export default function NewInvoice() {
  let { submission } = useTransition();
  return submission ? (
    <Invoice
      invoice={Object.fromEntries(
        submission.formData
      )}
    />
  ) : (
    <Form method="post">
      <input type="text" name="company" />
      <input type="text" name="amount" />
      <button type="submit">
        Create invoice
      </button>
    </Form>
  );
}
```

:::
