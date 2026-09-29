import { writeFileSync } from "node:fs";
import {
  inventorySeed,
  plans,
  initialSubscriber,
  initialRatings,
} from "../src/data.js";
const initial = {
  schema: 1,
  revision: 0,
  items: inventorySeed.map((i) => ({
    id: i.id,
    version: 1,
    name: i.name,
    category: i.category,
    costCents: Math.round(i.cost * 100),
    retailCents: Math.round(i.retail * 100),
    stock: i.stock,
    tags: i.tags,
    segment: i.segment,
    active: true,
  })),
  plans: plans.map((p) => ({
    id: p.id,
    version: 1,
    name: p.name,
    priceCents: Math.round(p.price * 100),
    itemCount: p.items,
    active: true,
  })),
  subscribers: [
    {
      id: initialSubscriber.id,
      version: 1,
      name: initialSubscriber.name,
      email: initialSubscriber.email,
      destination: "Portland, OR",
      planId: initialSubscriber.planId,
      status: "Active",
      preferredTags: [
        "Calm ritual",
        "Sensitive",
        "Citrus",
        "Low sugar",
        "Minimal",
      ],
      blockedTags: initialSubscriber.preferences.excluded,
      ratings: initialRatings.map((r) => ({
        itemId: r.itemId,
        rating: r.rating,
      })),
    },
  ],
  shipments: [],
};
writeFileSync(
  new URL("../src/initial.js", import.meta.url),
  "// Fictional seed only; reading missing storage does not write it.\nexport const initial = " +
    JSON.stringify(initial, null, 2) +
    ";\n",
);
