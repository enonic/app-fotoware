export interface Request {
	body :string // Often JSON
	headers: {
		readonly 'User-Agent' :string
	}
	remoteAddress :string
}
