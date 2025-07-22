import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

// Activity Logging Function
export const logActivity = async (
  action,
  type,
  itemName,
  itemId = null,
  additionalInfo = {}
) => {
  try {
    if (!auth.currentUser) {
      console.error("No authenticated user found for logging activity.");
      return; // Don't throw to avoid breaking the main operation
    }

    const activityData = {
      action, // 'create', 'update', 'delete', 'login', 'logout'
      type, // 'umkm', 'news', 'gallery', 'location', 'generalInfo', 'auth'
      itemName: itemName || "Unknown Item",
      itemId,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || "Unknown Email",
      timestamp: serverTimestamp(),
      additionalInfo,
    };

    console.debug("Logging activity:", activityData); // Debug log
    const docRef = await addDoc(collection(db, "activities"), activityData);
    console.debug("Activity logged successfully, ID:", docRef.id);
  } catch (error) {
    console.error(`Error logging activity (${action}, ${type}):`, error);
    // Don't throw to prevent breaking the main operation
  }
};

// Get Activities
export const getActivities = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

// Authentication Functions
export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Log login activity
    await logActivity("login", "auth", `Admin login: ${email}`);

    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    const user = auth.currentUser;
    const email = user?.email || "Unknown";

    await signOut(auth);

    // Log logout activity
    await logActivity("logout", "auth", `Admin logout: ${email}`);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// UMKM CRUD with Activity Logging
export const createUmkm = async (data) => {
  try {
    if (!data.name) {
      throw new Error("UMKM name is required for creation");
    }
    const umkmData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "umkm"), umkmData);

    // Log activity
    await logActivity("create", "umkm", data.name, docRef.id, {
      description:
        data.description?.substring(0, 100) + "..." || "No description",
      // category: data.category || "No category",
    });

    return { id: docRef.id, ...umkmData };
  } catch (error) {
    console.error("Error creating UMKM:", error);
    throw error;
  }
};

export const getUmkms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "umkm"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    throw error;
  }
};

export const getUmkmById = async (id) => {
  try {
    const docRef = doc(db, "umkm", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("UMKM not found");
    }
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    throw error;
  }
};

export const updateUmkm = async (id, data) => {
  try {
    if (!data.name) {
      throw new Error("UMKM name is required for update");
    }
    const docRef = doc(db, "umkm", id);
    const umkmData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, umkmData);

    // Log activity
    await logActivity("update", "umkm", data.name, id, {
      description:
        data.description?.substring(0, 100) + "..." || "No description",
      // category: data.category || "No category",
    });

    return { id, ...umkmData };
  } catch (error) {
    console.error("Error updating UMKM:", error);
    throw error;
  }
};

export const deleteUmkm = async (id) => {
  try {
    // Get UMKM data before deleting for logging
    const umkmDoc = await getDoc(doc(db, "umkm", id));
    if (!umkmDoc.exists()) {
      throw new Error("UMKM not found for deletion");
    }
    const umkmData = umkmDoc.data();

    const docRef = doc(db, "umkm", id);
    await deleteDoc(docRef);

    // Log activity
    await logActivity("delete", "umkm", umkmData?.name || "Unknown UMKM", id);
  } catch (error) {
    console.error("Error deleting UMKM:", error);
    throw error;
  }
};

// News CRUD with Activity Logging
export const createNews = async (data) => {
  try {
    if (!data.title) {
      throw new Error("News title is required for creation");
    }
    const newsData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "news"), newsData);

    // Log activity
    await logActivity("create", "news", data.title, docRef.id, {
      content: data.content?.substring(0, 100) + "..." || "No content",
      // category: data.category || "No category",
    });

    return { id: docRef.id, ...newsData };
  } catch (error) {
    console.error("Error creating News:", error);
    throw error;
  }
};

export const getNews = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "news"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching News:", error);
    throw error;
  }
};

export const getNewsById = async (id) => {
  try {
    const docRef = doc(db, "news", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("News not found");
    }
  } catch (error) {
    console.error("Error fetching News:", error);
    throw error;
  }
};

export const updateNews = async (id, data) => {
  try {
    if (!data.title) {
      throw new Error("News title is required for update");
    }
    const docRef = doc(db, "news", id);
    const newsData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, newsData);

    // Log activity
    await logActivity("update", "news", data.title, id, {
      content: data.content?.substring(0, 100) + "..." || "No content",
      // category: data.category || "No category",
    });

    return { id, ...newsData };
  } catch (error) {
    console.error("Error updating News:", error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  try {
    // Get News data before deleting for logging
    const newsDoc = await getDoc(doc(db, "news", id));
    if (!newsDoc.exists()) {
      throw new Error("News not found for deletion");
    }
    const newsData = newsDoc.data();

    const docRef = doc(db, "news", id);
    await deleteDoc(docRef);

    // Log activity
    await logActivity("delete", "news", newsData?.title || "Unknown News", id);
  } catch (error) {
    console.error("Error deleting News:", error);
    throw error;
  }
};

// Gallery CRUD with Activity Logging
export const createGallery = async (data) => {
  try {
    if (!data.name && !data.title) {
      throw new Error("Gallery name or title is required for creation");
    }
    const galleryData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "gallery"), galleryData);

    // Log activity
    await logActivity("create", "gallery", data.name || data.title, docRef.id, {
      description:
        data.description?.substring(0, 100) + "..." || "No description",
      imageUrl: data.imageUrl ? "Image uploaded" : "No image",
    });

    return { id: docRef.id, ...galleryData };
  } catch (error) {
    console.error("Error creating Gallery:", error);
    throw error;
  }
};

export const getGallery = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "gallery"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching Gallery:", error);
    throw error;
  }
};

export const getGalleryById = async (id) => {
  try {
    const docRef = doc(db, "gallery", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Gallery item not found");
    }
  } catch (error) {
    console.error("Error fetching Gallery:", error);
    throw error;
  }
};

export const updateGallery = async (id, data) => {
  try {
    if (!data.name && !data.title) {
      throw new Error("Gallery name or title is required for update");
    }
    const docRef = doc(db, "gallery", id);
    const galleryData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, galleryData);

    // Log activity
    await logActivity("update", "gallery", data.name || data.title, id, {
      description:
        data.description?.substring(0, 100) + "..." || "No description",
    });

    return { id, ...galleryData };
  } catch (error) {
    console.error("Error updating Gallery:", error);
    throw error;
  }
};

export const deleteGallery = async (id) => {
  try {
    // Get Gallery data before deleting for logging
    const galleryDoc = await getDoc(doc(db, "gallery", id));
    if (!galleryDoc.exists()) {
      throw new Error("Gallery item not found for deletion");
    }
    const galleryData = galleryDoc.data();

    const docRef = doc(db, "gallery", id);
    await deleteDoc(docRef);

    // Log activity
    await logActivity(
      "delete",
      "gallery",
      galleryData?.name || galleryData?.title || "Unknown Gallery Item",
      id
    );
  } catch (error) {
    console.error("Error deleting Gallery:", error);
    throw error;
  }
};

// Locations CRUD with Activity Logging
export const createLocation = async (data) => {
  try {
    if (!data.name) {
      throw new Error("Location name is required for creation");
    }
    const locationData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "locations"), locationData);

    // Log activity
    await logActivity("create", "location", data.name, docRef.id, {
      address: data.address || "No address",
      coordinates: data.coordinates ? "Coordinates set" : "No coordinates",
    });

    return { id: docRef.id, ...locationData };
  } catch (error) {
    console.error("Error creating Location:", error);
    throw error;
  }
};

export const getLocations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "locations"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching Locations:", error);
    throw error;
  }
};

export const getLocationById = async (id) => {
  try {
    const docRef = doc(db, "locations", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error("Error fetching Location:", error);
    throw error;
  }
};

export const updateLocation = async (id, data) => {
  try {
    if (!data.name) {
      throw new Error("Location name is required for update");
    }
    const docRef = doc(db, "locations", id);
    const locationData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, locationData);

    // Log activity
    await logActivity("update", "location", data.name, id, {
      address: data.address || "No address",
    });

    return { id, ...locationData };
  } catch (error) {
    console.error("Error updating Location:", error);
    throw error;
  }
};

export const deleteLocation = async (id) => {
  try {
    // Get Location data before deleting for logging
    const locationDoc = await getDoc(doc(db, "locations", id));
    if (!locationDoc.exists()) {
      throw new Error("Location not found for deletion");
    }
    const locationData = locationDoc.data();

    const docRef = doc(db, "locations", id);
    await deleteDoc(docRef);

    // Log activity
    await logActivity(
      "delete",
      "location",
      locationData?.name || "Unknown Location",
      id
    );
  } catch (error) {
    console.error("Error deleting Location:", error);
    throw error;
  }
};

// General Info CRUD with Activity Logging
export const createGeneralInfo = async (data) => {
  try {
    if (!data.title) {
      throw new Error("General Info title is required for creation");
    }
    const infoData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "generalInfo"), infoData);

    // Log activity
    await logActivity(
      "create",
      "generalInfo",
      data.title || "General Info",
      docRef.id
    );

    return { id: docRef.id, ...infoData };
  } catch (error) {
    console.error("Error creating General Info:", error);
    throw error;
  }
};

export const getGeneralInfo = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "generalInfo"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching General Info:", error);
    throw error;
  }
};

export const updateGeneralInfo = async (id, data) => {
  try {
    if (!data.title) {
      throw new Error("General Info title is required for update");
    }
    const docRef = doc(db, "generalInfo", id);
    const infoData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, infoData);

    // Log activity
    await logActivity(
      "create",
      "generalInfo",
      data.title || "General Info",
      id
    );

    return { id, ...infoData };
  } catch (error) {
    console.error("Error updating General Info:", error);
    throw error;
  }
};

export const deleteGeneralInfo = async (id) => {
  try {
    // Get General Info data before deleting for logging
    const infoDoc = await getDoc(doc(db, "generalInfo", id));
    if (!infoDoc.exists()) {
      throw new Error("General Info not found for deletion");
    }
    const infoData = infoDoc.data();

    const docRef = doc(db, "generalInfo", id);
    await deleteDoc(docRef);

    // Log activity
    await logActivity(
      "delete",
      "generalInfo",
      infoData?.title || "Unknown Info",
      id
    );
  } catch (error) {
    console.error("Error deleting General Info:", error);
    throw error;
  }
};
