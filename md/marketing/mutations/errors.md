:::

```tsx [6-15]
export default function InvoiceRoute() {
  let invoice = useLoaderData();
  return <Invoice data={invoice} />;
}
```

---

```tsx [6-15]
export default function InvoiceRoute() {
  let invoice = useLoaderData();
  return <Invoice data={invoice} />;
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <div>
      <h2>Oh snap!</h2>
      <p>
        There was a problem loading this invoice
      </p>
    </div>
  );
}
```

---

```tsx
export default function InvoiceRoute() {
  let invoice = useLoaderData();
  return <Invoice data={invoice} />;
}
```

:::
