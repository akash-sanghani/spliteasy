const lambdaBaseUrl =
  "https://3xebuaiwyxarvcbt4rvxc2mbf40eefji.lambda-url.us-east-1.on.aws/splitwise";

export async function getAccessTokenFromLambda(code) {
  const redirect_uri = "http://localhost:5173"; // must match OAuth setup

  const res = await fetch(
    `${lambdaBaseUrl}/splitwise/access_token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        redirect_uri,
      }),
    }
  );

  return await res.json(); // expects { access_token: "..." }
}


export async function getGroupsFromLambda(accessToken) {
  const res = await fetch(
    `${lambdaBaseUrl}/splitwise/get_groups`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        access_token: accessToken,
      }),
    }
  );

  return await res.json(); // expects { groups: [...] }
}