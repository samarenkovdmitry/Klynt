export async function linearGraphQL(
  token: string,
  query: string,
  variables?: Record<string, unknown>
) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}
