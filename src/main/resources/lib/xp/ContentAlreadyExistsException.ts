type Branch = string | null
type ContentPath = string
type RepositoryId = string | null

export class ContentAlreadyExistsException extends /*NotFoundException*/ Error {

	private static buildMessage(path: ContentPath, repositoryId: RepositoryId, branch: Branch): string {
		// Source Java Implementation
		// return Stream.of(
		// 	MessageFormat.format(
		// 		"Content at path [{0}]", path
		// 	),
		// 	repositoryId != null ? MessageFormat.format( "in repository [{0}]", repositoryId ) : "",
		// 	branch != null ? MessageFormat.format( "in branch [{0}]", branch ) : "",
		// 	"already exists"
		// )
		// 	.filter( Predicate.not( String::isEmpty ) )
		// 	.collect( Collectors.joining( " " ) );

		// Implementation using array, filter out empty, join on single space
		return [
			`Content at path [${path}]`,
			repositoryId != null
				? `in repository [${repositoryId}] `
				: undefined,
			branch != null
				? `in branch [${branch}] `
				: undefined,
			'already exists'
		].filter(x=>x).join(' ');

		// Implementation using string concat and making sure whitespace is correct
		// return `Content at path [${path}] ${
		// 	repositoryId != null ? `in repository [${repositoryId}] `: ''
		// }${
		// 	branch != null ? `in branch [${branch}] `: ''
		// }already exists`;
	}

	// Defined in Error (super)
	// cause: unknown
	// columnNumber: number // Non-standard
	// fileName: string // Non-standard
	// lineNumber: number // Non-standard
	// message: string
	// name: string
	// stack: any // Non-standard

	// Static property 'name' conflicts with built-in property 'Function.name' of constructor function 'ContentAlreadyExistsException'.
	// static name = 'com.enonic.xp.content.ContentAlreadyExistsException';

	readonly branch: Branch
	public readonly code: string // Perhaps defined in NotFoundException
	readonly path: ContentPath
	readonly repositoryId: RepositoryId

	constructor(
		path: ContentPath,
		repositoryId: RepositoryId = null, // NOTE: The null fallback is deprecated
		branch: Branch = null, // NOTE: The null fallback is deprecated
		// ...params: unknown[]
	) {
		super(
			ContentAlreadyExistsException.buildMessage(
				path, repositoryId, branch
			),
			// ...params
		);
		this.path = path;
		this.repositoryId = repositoryId;
		this.branch = branch;
		this.code = 'contentAlreadyExists';
		this.name = 'com.enonic.xp.content.ContentAlreadyExistsException';
	}

	public getBranch() {
		return this.branch;
	}

	// Doesn't exist on Error, perhaps it exists on NotFoundException
	public getCode() {
		return this.code;
	}

	public getContentPath() {
		return this.path;
	}

	public getRepositoryId() {
		return this.repositoryId;
	}

	// Defined in Error (super)
	//public toString()
}
