export interface MediaContent {
	_id: string
	_path :string
	data: {
		fotoWare: { // Custom requireValid must be false
			md5sum? :string
		}
		media: {
			attachment :string
		}
	}
}
