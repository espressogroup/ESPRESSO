import querystring from 'querystring';
import url from 'url';
import axios from "axios";
import { QueryEngine } from "@comunica/query-sparql";
import { getLoggerFor, HttpHandler, HttpHandlerInput } from "@solid/community-server";


export class SearchListener extends HttpHandler {

  protected readonly logger = getLoggerFor(this);
  protected readonly myEngine = new QueryEngine();

  public constructor() {
    super();
  }

  public async handle({ request, response }: HttpHandlerInput): Promise<void> {
    const urlRequested: string = request.url || "";
    const { query } = url.parse(urlRequested) || "";
    const { keyword } = querystring.parse(query || "");
    if (!keyword) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ "error": "invalid keyword" }));
    }
    const sources = await this.readSources();
    const queryCommand: string = `
    PREFIX ns1: <http://example.org/SOLID/>
    SELECT  ?address ?frequency
    WHERE {
    ?x ns1:appearsIn
    [ ns1:address ?address ;
    ns1:frequency ?frequency ] ;
    ns1:lemma ?"${keyword}".  
    }  ORDER BY DESC(?frequency) LIMIT 100 
  `;
    const bindingsStream: any = await this.myEngine.queryBindings(queryCommand, { sources: sources });
    const bindings = await bindingsStream.toArray();
    const result = bindings.map((item: any) => ({ "address": item.get('address').value, "frequency": item.get('frequency').value }))
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(result));
  }
  public async readSources() {
    const response = await axios.get("http://localhost:5000/Reza-Test/IndexSource-Address.csv", { responseType: 'blob', });
    const csvStr = await response.data;
    const result = csvStr.split("\r\n").filter((i: string) => i.length > 0);
    return result; //JavaScript object
  }
}
