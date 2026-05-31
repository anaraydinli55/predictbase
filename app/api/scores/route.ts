// /api/scores/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('id');
  
  const response = await fetch(`https://api.balldontlie.io/v1/fh/matches/${matchId}`, {
    headers: { 'Authorization': process.env.BALLDONTLIE_API_KEY }
  });
  
  const data = await response.json();
  return Response.json(data);
}
