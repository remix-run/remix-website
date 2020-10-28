import React from "react";
import PublicTopNav from "./PublicTopNav";
import CacheControl from "../utils/CacheControl";

export function headers() {
  return CacheControl.public;
}

export function meta() {
  return {
    title: "Contact | Remix",
  };
}

export default function Contact() {
  return (
    <form
      action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8"
      method="POST"
      oid="00D3i000000rmWq"
    >
      <input type="hidden" name="oid" value="00D3i000000rmWq" />
      <input type="hidden" name="retURL" value="https://remix.run/buy" />
      <input label="First name" name="first_name" required />
      <input label="Last name" name="last_name" required />
      <input label="Email" name="email" required />
      <input label="Role/Title" name="title" />
      <input label="Company" name="company" />
      <input
        type="number"
        label="Team Size"
        name="00N3i0000093qmN"
        defaultValue="20"
        min="0"
        max="100"
      />
      <input label="Phone" name="phone" />
      <button type="submit">Let's Talk</button>
    </form>
  );
}
