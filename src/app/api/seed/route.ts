import { NextResponse } from "next/server";
import { seedDemoData } from "@/lib/db/seed";

export async function POST() {
  try {
    await seedDemoData();
    return NextResponse.json({
      success: true,
      message: "Demo data seeded successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Seeding failed",
      },
      { status: 500 }
    );
  }
}
