import { State } from "country-state-city";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params: { country } }: any) {

  // console.log(country)
  try {
    const stateNames = State.getStatesOfCountry(country).map((state) => ({
      code: state.isoCode,
      name: state.name,
    }));

    // console.log(stateNames)

    return NextResponse.json(stateNames); // Return the state names as a JSON response
  } catch (error:any) {
    console.error("Error fetching state names:", error);
    return NextResponse.json(
      { error: "Error fetching state names", details: error.message },
      { status: 500 }
    );
  }
}
