export namespace main {
	
	export class FileDetailsResult {
	    name: string;
	    size: number;
	    path: string;
	    humanSize: string;
	    hash: string;
	
	    static createFrom(source: any = {}) {
	        return new FileDetailsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.path = source["path"];
	        this.humanSize = source["humanSize"];
	        this.hash = source["hash"];
	    }
	}

}

