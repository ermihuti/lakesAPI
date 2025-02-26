import { createConnection } from '$lib/db/mysql';
import { BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } from '$env/static/private';

export async function GET() {
	const connection = await createConnection();
	const [rows] = await connection.execute('SELECT * FROM lakes');
	await connection.end();

	return new Response(JSON.stringify(rows), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

async function authenticate(request) {
	const auth = request.headers.get('authorization');
	if (!auth) {
		return new Response(null, {
			status: 401,
			headers: { 'www-authenticate': 'Basic realm="Lakes API"' }
		});
	}

	const base64Credentials = auth.split(' ')[1];
	const credentials = atob(base64Credentials);
	const [username, password] = credentials.split(':');

	if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASSWORD) {
		return new Response(JSON.stringify({ message: 'Access denied' }), {
			status: 401,
			headers: { 'www-authenticate': 'Basic realm="Lakes API"' }
		});
	}

	return null;
}

export async function POST({ request }) {
	const authResponse = await authenticate(request);
	if (authResponse) return authResponse;

	const connection = await createConnection();
	const data = await request.json();

	await connection.execute(
		'INSERT INTO lakes (name, area, depth, elevation, type) VALUES (?, ?, ?, ?, ?)',
		[data.name, data.area, data.depth, data.elevation, data.type]
	);

	await connection.end();

	return new Response(JSON.stringify(data), {
		status: 201,
		headers: { 'content-type': 'application/json' }
	});
}