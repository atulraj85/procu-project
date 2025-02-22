import { City, State } from "country-state-city";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params: { country, state } }: any) {
  // console.log(country, state)
  try {
    const cityNames = City.getCitiesOfState(country, state).map((city) => ({
      name: city.name,
    }));

    return NextResponse.json(cityNames); // Return the city names as a JSON response
  } catch (error: any) {
    console.error("Error fetching city names:", error);
    return NextResponse.json(
      { error: "Error fetching city names", details: error.message },
      { status: 500 }
    );
  }
}
