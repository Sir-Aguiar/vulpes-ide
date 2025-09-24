import { dbAdmin } from "@/utils/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
// Importe a instância do Admin SDK

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanBody = structuredClone(body);

    // Use a coleção do Admin SDK para adicionar o documento
    const docRef = await dbAdmin.collection("tasks").add(cleanBody);

    return NextResponse.json({ id: docRef.id, ...cleanBody }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding document:", error);
    return NextResponse.json({ error: "Failed to create task", details: error.message }, { status: 500 });
  }
}

export function GET() {
  return new Response("Hello, Next.js!", { status: 200 });
}
