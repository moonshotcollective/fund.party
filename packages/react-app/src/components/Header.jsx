import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="/" rel="noopener noreferrer">
      <PageHeader
        title="🤑 Fund.Party"
        subTitle="Create public goods that support retroactive funding"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
