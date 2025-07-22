import { getAuth } from "firebase/auth";

export const addPlaceToGoogleMaps = async ({
  name,
  address,
  latitude,
  longitude,
  placeType,
}) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const idToken = await user.getIdToken();

    const response = await fetch(
      "https://us-central1-pakeladmin.cloudfunctions.net/addPlace",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name,
          formatted_address: address,
          geometry: {
            location: { lat: latitude, lng: longitude },
          },
          types: [placeType],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.place_id;
  } catch (error) {
    console.error("Error adding place to Google Maps:", error);
    throw error;
  }
};
