import { pinata } from "@/utils/config";
import { NextRequest } from "next/server";

// Helper function to filter data based on the time filter
function filterDataByTime(dataArray, filter) {
  const now = new Date();

  let cutoffDate;
  switch (filter) {
    case "last-10-minutes":
      cutoffDate = new Date(now.getTime() - 10 * 60 * 1000); // Last 10 minutes
      break;
    case "last-hour":
      cutoffDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
      break;
    case "all-time":
    default:
      cutoffDate = new Date(0); // All time
      break;
  }

  return dataArray.filter((entry) => new Date(entry.timestamp) >= cutoffDate);
}

// Function to calculate a weighted average
function calculateWeightedAverage(dataArray) {
  if (dataArray.length === 0) return { average: 0, lastTimestamp: null };

  // Weighted sum: more recent data points get higher weights
  const weightFactor = 1.2; // Adjust this value for how much emphasis you want on recent data
  let weightedSum = 0;
  let totalWeight = 0;

  // Calculate weighted sum and total weight
  for (let i = 0; i < dataArray.length; i++) {
    const weight = Math.pow(weightFactor, i); // Exponentially increasing weight for recent data
    weightedSum += Number(dataArray[i].data) * weight;
    totalWeight += weight;
  }

  // Calculate the weighted average
  const weightedAverage = (weightedSum / totalWeight).toFixed(2);
  const lastTimestamp = new Date(dataArray[dataArray.length - 1]?.timestamp).toISOString();

  return {
    average: weightedAverage,
    lastTimestamp,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("timeFilter") || "all-time";

    // Fetch the list of files
    const filesResponse = await pinata.files.list();
    const files = filesResponse?.files ?? [];

    const aggregatedData = {
      solar: [],
      water: [],
      temperature: [],
    };

    for (const file of files) {
      // Retrieve file content and type
      const { data, contentType } = await pinata.gateways.get(file.cid);
    
      // Safely merge data if available and tag with sensor type
      if (data?.solar) {
        const { average: solarAverage, lastTimestamp: solarLastTimestamp } = calculateWeightedAverage(data.solar);
        if (solarAverage && solarLastTimestamp) { // Only add if data exists
          aggregatedData.solar.push({
            timestamp: solarLastTimestamp, // Last timestamp of the file
            sensor: "solar",
            data: solarAverage,
          });
        }
      }
      if (data?.water) {
        const { average: waterAverage, lastTimestamp: waterLastTimestamp } = calculateWeightedAverage(data.water);
        if (waterAverage && waterLastTimestamp) { // Only add if data exists
          aggregatedData.water.push({
            timestamp: waterLastTimestamp, // Last timestamp of the file
            sensor: "water",
            data: waterAverage,
          });
        }
      }
      if (data?.temperature) {
        const { average: temperatureAverage, lastTimestamp: temperatureLastTimestamp } = calculateWeightedAverage(data.temperature);
        if (temperatureAverage && temperatureLastTimestamp) { // Only add if data exists
          aggregatedData.temperature.push({
            timestamp: temperatureLastTimestamp, // Last timestamp of the file
            sensor: "temperature",
            data: temperatureAverage,
          });
        }
      }
    }

    // Filter data based on the selected time filter
    const filteredData = {
      solar: filterDataByTime(aggregatedData.solar, filter),
      water: filterDataByTime(aggregatedData.water, filter),
      temperature: filterDataByTime(aggregatedData.temperature, filter),
    };

    // Sort the averages by timestamp in ascending order
    const sortByTimestamp = (a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp);

    filteredData.solar?.sort(sortByTimestamp);
    filteredData.water?.sort(sortByTimestamp);
    filteredData.temperature?.sort(sortByTimestamp);

    // Return the averaged data in the specified format
    return new Response(JSON.stringify(filteredData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        message: "An error occurred while processing the request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
