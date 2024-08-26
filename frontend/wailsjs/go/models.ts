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
	export class ResultsPage {
	    current: number;
	    total: number;
	    duplicates: FileDetailsResult[];
	
	    static createFrom(source: any = {}) {
	        return new ResultsPage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.current = source["current"];
	        this.total = source["total"];
	        this.duplicates = this.convertValues(source["duplicates"], FileDetailsResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

