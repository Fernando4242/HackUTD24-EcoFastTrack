// Snapshot function to save and upload data
export const uploadSnapshot = async (pinata, snapshotData) => {
  const timestamp = new Date().toISOString();
  const metadata = {
    timestamp: timestamp,
    totalRecords: snapshotData.water.length + snapshotData.temperature.length + snapshotData.solar.length,
    topics: Object.keys(snapshotData),
  };


  console.log(timestamp, metadata, snapshotData);
  try {
    const upload = await pinata.upload.json(snapshotData).addMetadata(metadata);
    console.log('Upload successful:', upload);
  } catch (error) {
    console.log("Error taking snapshot:", error);
  }
};
