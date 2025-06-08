import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const getMongoCollection = async (collection: string) => {
  // В v5+ connect() можно вызывать много раз, он сам следит за состоянием
  await client.connect();
  return client.db().collection(collection);
};
