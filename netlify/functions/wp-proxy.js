// Netlify function to proxy WordPress REST API calls
// Uses the server IP directly with correct Host header

const WP_HOST = "blog.avdesignintl.com";
const WP_IP = "91.210.232.91";

exports.handler = async (event, context) => {
  const path = event.path.replace("/.netlify/functions/wp-proxy", "");
  const queryString = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `http://${WP_IP}${path}${queryString}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "Host": WP_HOST,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "WordPress API error" }),
      };
    }

    const body = await response.text();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
      body,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Proxy error", details: error.message }),
    };
  }
};
