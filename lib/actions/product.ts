"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "../auth";
import { prisma } from "../prisma";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  sku: z.string().optional(),
  lowStockAt: z.coerce.number().int().min(0).optional(),
});

/* ================================
   CREATE PRODUCT
================================= */
export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku") || undefined,
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten());
    throw new Error("Validation failed");
  }

  const data = parsed.data;

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        sku: data.sku ?? null,
        lowStockAt: data.lowStockAt ?? null,
        userId: user.id,
      },
    });
  } catch (error: any) {
    console.error("Create product error:", error);

    if (error?.code === "P2002") {
      // Unique constraint (could be sku, or a composite unique index)
      throw new Error("A product with this value already exists.");
    }

    throw new Error("Failed to create product!");
  }

  // ⬅️ IMPORTANT: redirect OUTSIDE the try/catch
  redirect("/inventory");
}

/* ================================
   DELETE PRODUCT
================================= */
export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") || "");

  try {
    await prisma.product.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    throw new Error("Failed to delete product!");
  }
}
