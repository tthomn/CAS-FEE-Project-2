import * as firestore from "firebase/firestore";
import * as storage from "firebase/storage";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  orderBy,
  DocumentReference,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  getDocDataBy1Condition,
  getDocRefsBy1Condition,
  getDocRefsBy2Condition,
  getCollectionData,
  addDocToCollection,
  updateDocByRef,
  deleteDocByRef,
  uploadImageToStorage,
} from "../services/firebase/firestoreService";



// * 1) Mock "firebase/firestore" so we can intercept Firestore calls.

jest.mock("firebase/firestore", () => {
    const original = jest.requireActual("firebase/firestore");
    return {
      ...original,
      collection: jest.fn(),
      getDocs: jest.fn(),
      addDoc: jest.fn(),
      deleteDoc: jest.fn(),
      updateDoc: jest.fn(),
      query: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      // Mock Timestamp as a class with a static now method
      Timestamp: class {
        static now = jest.fn(() => "MOCK_TIMESTAMP");
      },
    };
  });

/**
 * 2) Mock "firebase/storage" so we can intercept Storage calls.
 */
jest.mock("firebase/storage", () => {
  const original = jest.requireActual("firebase/storage");
  return {
    ...original,
    ref: jest.fn(),
    uploadBytesResumable: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
  };
});

jest.mock("../services/firebase/firebaseConfig", () => ({
    db: {}, 
    storage: {
      app: {
        options: {
          storageBucket: "my-bucket",
        },
      },
    },
  }));
  


const mockCollectionRef = {} as firestore.CollectionReference;
const mockDocRef = { id: "mockDocRefID" } as DocumentReference;

const mockDocsData = [
  { id: "doc1", data: () => ({ name: "John", age: 30 }) },
  { id: "doc2", data: () => ({ name: "Jane", age: 25 }) },
];

// A helper to simulate a Firestore querySnapshot
function createQuerySnapshot(docs: any[]) {
  return {
    docs,
    size: docs.length,
    empty: docs.length === 0,
  };
}

beforeEach(() => {
  jest.clearAllMocks();

  // -------------------------
  // Firestore default mocks
  // -------------------------
  (collection as jest.Mock).mockReturnValue(mockCollectionRef);
  (query as jest.Mock).mockReturnValue("mockedQuery");
  (where as jest.Mock).mockReturnValue("mockedWhere");
  (orderBy as jest.Mock).mockReturnValue("mockedOrderBy");
  (getDocs as jest.Mock).mockResolvedValue(createQuerySnapshot(mockDocsData));
  (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
  (updateDoc as jest.Mock).mockResolvedValue(undefined);
  (deleteDoc as jest.Mock).mockResolvedValue(undefined);

  // -------------------------
  // Storage default mocks
  // -------------------------
  (storageRef as jest.Mock).mockReturnValue("mockStorageRef");
  (uploadBytesResumable as jest.Mock).mockReturnValue({
    on: (
      _event: string,
      _progress: unknown,
      errorCb: (e: Error) => void,
      completeCb: () => void
    ) => {
      completeCb();
    },
    snapshot: { ref: "someSnapshotRef" },
  });
  (getDownloadURL as jest.Mock).mockResolvedValue("https://fake-download-url");
  (deleteObject as jest.Mock).mockResolvedValue(undefined);
});

describe("firestoreService", () => {
  // ------------------------------------------------------
  // getDocDataBy1Condition
  // ------------------------------------------------------
  describe("getDocDataBy1Condition", () => {
    it("should fetch documents matching one condition", async () => {
      const result = await getDocDataBy1Condition("users", "age", "==", 30);
      // Check that Firestore was called correctly
      expect(collection).toHaveBeenCalledWith(expect.anything(), "users");
      expect(where).toHaveBeenCalledWith("age", "==", 30);
      expect(getDocs).toHaveBeenCalledWith("mockedQuery");

      // Check the result
      expect(result).toEqual([
        { id: "doc1", name: "John", age: 30 },
        { id: "doc2", name: "Jane", age: 25 },
      ]);
    });

    it("should throw an error if the query fails", async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error("Firestore error"));
      await expect(
        getDocDataBy1Condition("users", "age", "==", 30)
      ).rejects.toThrow("Firestore error");
    });
  });

  // ------------------------------------------------------
  // getDocRefsBy1Condition
  // ------------------------------------------------------
  describe("getDocRefsBy1Condition", () => {
    it("should return document references matching one condition", async () => {
      const docsWithRefs = mockDocsData.map((doc) => ({
        ...doc,
        ref: { id: doc.id },
      }));
      (getDocs as jest.Mock).mockResolvedValueOnce(createQuerySnapshot(docsWithRefs));

      const result = await getDocRefsBy1Condition("orders", "status", "==", "open");
      expect(where).toHaveBeenCalledWith("status", "==", "open");
      expect(result).toEqual([{ id: "doc1" }, { id: "doc2" }]);
    });

    it("should throw an error on Firestore failure", async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error("Some error"));
      await expect(
        getDocRefsBy1Condition("orders", "status", "==", "open")
      ).rejects.toThrow("Some error");
    });
  });

  // ------------------------------------------------------
  // getDocRefsBy2Condition
  // ------------------------------------------------------
  describe("getDocRefsBy2Condition", () => {
    it("should return document references matching two conditions", async () => {
      const docsWithRefs = mockDocsData.map((doc) => ({
        ...doc,
        ref: { id: doc.id },
      }));
      (getDocs as jest.Mock).mockResolvedValueOnce(createQuerySnapshot(docsWithRefs));

      const result = await getDocRefsBy2Condition(
        "orders",
        "status",
        "==",
        "open",
        "priority",
        "==",
        "high"
      );
      expect(where).toHaveBeenCalledTimes(2);
      expect(where).toHaveBeenNthCalledWith(1, "status", "==", "open");
      expect(where).toHaveBeenNthCalledWith(2, "priority", "==", "high");
      expect(result).toEqual([{ id: "doc1" }, { id: "doc2" }]);
    });

    it("should throw an error on Firestore failure", async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error("Some error"));
      await expect(
        getDocRefsBy2Condition("orders", "status", "==", "open", "priority", "==", "high")
      ).rejects.toThrow("Some error");
    });
  });

  // ------------------------------------------------------
  // getCollectionData
  // ------------------------------------------------------
  describe("getCollectionData", () => {
    it("fetches entire collection data (no constraints)", async () => {
      const data = await getCollectionData<{ name: string; age: number }>("users");
      expect(collection).toHaveBeenCalledWith(expect.anything(), "users");
      // Query called with no constraints
      expect(query).toHaveBeenCalledWith(mockCollectionRef);
      expect(getDocs).toHaveBeenCalledWith("mockedQuery");
      expect(data).toEqual([
        { id: "doc1", name: "John", age: 30 },
        { id: "doc2", name: "Jane", age: 25 },
      ]);
    });

    it("fetches collection data with constraints", async () => {
      const constraints = [where("active", "==", true), orderBy("createdAt", "asc")];
      await getCollectionData("users", constraints);
      expect(query).toHaveBeenCalledWith(mockCollectionRef, ...constraints);
    });

    it("throws error if fetching fails", async () => {
      (getDocs as jest.Mock).mockRejectedValueOnce(new Error("Collection fetch error"));
      await expect(getCollectionData("users")).rejects.toThrow("Collection fetch error");
    });
  });

  // ------------------------------------------------------
  // addDocToCollection
  // ------------------------------------------------------
  describe("addDocToCollection", () => {
    it("adds a doc and returns the doc ID", async () => {
      (addDoc as jest.Mock).mockResolvedValueOnce({ id: "mockDocID" });

      const payload = { name: "Test", age: 99 };
      const docId = await addDocToCollection("users", payload);
      

      expect(collection).toHaveBeenCalledWith(expect.anything(), "users");
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        name: "Test",
        age: 99,
      });
      expect(docId).toBe("mockDocID");
    });

    it("throws if adding fails", async () => {
      (addDoc as jest.Mock).mockRejectedValueOnce(new Error("Add doc error"));
      await expect(
        addDocToCollection("users", { foo: "bar" })
      ).rejects.toThrow("Add doc error");
    });
  });

  // ------------------------------------------------------
  // updateDocByRef
  // ------------------------------------------------------
  describe("updateDocByRef", () => {
    it("updates document fields", async () => {
      await updateDocByRef(mockDocRef, { name: "Updated" });
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { name: "Updated" });
    });

    it("throws if update fails", async () => {
      (updateDoc as jest.Mock).mockRejectedValueOnce(new Error("Update doc error"));
      await expect(updateDocByRef(mockDocRef, { name: "Fail" })).rejects.toThrow(
        "Update doc error"
      );
    });
  });

  // ------------------------------------------------------
  // deleteDocByRef
  // ------------------------------------------------------
  describe("deleteDocByRef", () => {
    it("deletes the document", async () => {
      await deleteDocByRef(mockDocRef);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("throws if delete fails", async () => {
      (deleteDoc as jest.Mock).mockRejectedValueOnce(new Error("Delete doc error"));
      await expect(deleteDocByRef(mockDocRef)).rejects.toThrow("Delete doc error");
    });
  });

  // ------------------------------------------------------
  // uploadImageToStorage
  // ------------------------------------------------------
  describe("uploadImageToStorage", () => {
    it("uploads an image and returns download URL", async () => {
   
      const mockFile = new File(["content"], "test.jpg", { type: "image/jpg" });
      const result = await uploadImageToStorage(mockFile, "testFolder");
      expect(storageRef).toHaveBeenCalledWith(expect.anything(), "testFolder/test.jpg");
      expect(uploadBytesResumable).toHaveBeenCalledWith("mockStorageRef", mockFile, {
        cacheControl: "public, max-age=31536000",
      });
      expect(getDownloadURL).toHaveBeenCalledWith("someSnapshotRef");
      expect(result).toBe("https://fake-download-url");
    });

    it("throws if upload fails", async () => {
      (uploadBytesResumable as jest.Mock).mockReturnValue({
        on: (
          _event: string,
          _progress: any,
          errorCb: (e: Error) => void,
          _completeCb: () => void
        ) => {
          // Call error callback
          errorCb(new Error("Upload error"));
        },
        snapshot: {},
      });

      await expect(
        uploadImageToStorage(new File([], "fail.png"), "folder")
      ).rejects.toThrow("Upload error");
    });
  });
});


