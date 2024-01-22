package com.ibm.solid;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.Statement;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectBody;
import net.sf.jsqlparser.statement.select.SelectItem;

import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Reza Moosaei, 3/7/23 6:03 PM
 * Parsing User SQL query to extract Keyword
 */
public class SqlParser {
    public Map<String, String> getCondition(String sql) throws JSQLParserException {
        Map<String, String> result = new HashMap<>();
        StringReader stream = new StringReader(sql);
        Statement statement = CCJSqlParserUtil.parse(stream);
        if (statement instanceof Select) {
            Select select = (Select) statement;
            SelectBody selectBody = select.getSelectBody();
            if (selectBody instanceof PlainSelect) {
                PlainSelect plainSelect = (PlainSelect) selectBody;

                List<SelectItem> selectItems = plainSelect.getSelectItems();
                result.put("tableName", plainSelect.getFromItem().toString());
                for (SelectItem selectItem : selectItems) {
                }

                Expression where = plainSelect.getWhere();
                if (where != null) {
                    System.out.println("WHEREclause: " + where);
                    Expression rightExpression = ((EqualsTo) where).getRightExpression();
                    Expression leftExpression = ((EqualsTo) where).getLeftExpression();
                    result.put("rightExpression", rightExpression.toString());
                    result.put("leftExpression", leftExpression.toString());
                }
            }
        }
        return result;
    }


/**
     * Extracts a SPARQL query from a SQL query comment.
     *
     * @param sql The SQL query containing the SPARQL query as a comment.
     * @return The extracted SPARQL query or an empty string if not found.
     */
//    public String extractSparqlQuery(String sql) {
//        StringBuilder sparqlQuery = new StringBuilder();
//        System.out.println("::::: in parser::::"+sql);
//        String[] lines = sql.split("\n");
//        boolean inSparqlComment = false;
//
//        for (String line : lines) {
//            if (line.trim().startsWith("--")) {
//                inSparqlComment = true;
//                // Remove the SQL comment syntax ('--') and add the line to the SPARQL query
//                sparqlQuery.append(line.trim().substring(2).trim()).append("\n");
//            } else if (inSparqlComment) {
//                // If a non-comment line is encountered after starting the SPARQL comment, stop adding lines
//
//                break;
//            }
//        }
//
//         System.out.println("::::: in parser 2::::"+sparqlQuery.toString().trim());
//
//        return sparqlQuery.toString().trim();
//    }


//this works fine in barista...
//public String extractSparqlQuery(String sql) {
//    StringBuilder sparqlQuery = new StringBuilder();
//    System.out.println("::::: in parser::::" + sql);
//
//    String[] lines = sql.split("\n");
//    boolean inSparqlComment = false;
//
//    for (String line : lines) {
//        line = line.trim();
//        // Check if the line is part of the SPARQL query
//        if (line.startsWith("--") || inSparqlComment) {
//            inSparqlComment = true;
//            // Check for the start of the actual SPARQL query (excluding "SPARQL Query: --")
//            if (line.toLowerCase().startsWith("-- sparql query:")) {
//                continue;
//            }
//            // Remove the SQL comment syntax ('--') and add the line to the SPARQL query
//            String sparqlPart = line.substring(2).trim();
//            if (!sparqlPart.isEmpty()) {
//                sparqlQuery.append(sparqlPart).append("\n");
//            }
//        } else if (inSparqlComment) {
//            // If a non-comment line is encountered after starting the SPARQL comment, stop adding lines
//            break;
//        }
//    }
//
//    System.out.println("::::: in parser 2::::" + sparqlQuery.toString().trim());
//    return sparqlQuery.toString().trim();
//}


//works for queryderby.sh ///

public String extractSparqlQuery(String sql) {
    StringBuilder sparqlQuery = new StringBuilder();
    System.out.println("::::: in parser::::" + sql);

    // Check for the index of the SPARQL query marker
    int sparqlStartIndex = sql.indexOf("-- SPARQL Query: --");
    if (sparqlStartIndex != -1) {
        // Extract the substring that contains the SPARQL query
        String sparqlSection = sql.substring(sparqlStartIndex + "-- SPARQL Query: --".length()).trim();

        // Splitting the SPARQL section into lines
        String[] lines = sparqlSection.contains("\n") ? sparqlSection.split("\n") : new String[]{sparqlSection};

        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("--")) {
                line = line.substring(2).trim();
            }
            if (!line.isEmpty()) {
                sparqlQuery.append(line).append("\n");
            }
        }
    }

    System.out.println("::::: in parser 2:?::" + sparqlQuery.toString().trim());
    return sparqlQuery.toString().trim();
}






}