export namespace main {
	
	export class ResultsPage {
	    current: number;
	    total: number;
	    duplicates: {[key: string]: FileDetails[]};
	
	    static createFrom(source: any = {}) {
	        return new ResultsPage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.current = source["current"];
	        this.total = source["total"];
	        this.duplicates = source["duplicates"];
	    }
	}

}

