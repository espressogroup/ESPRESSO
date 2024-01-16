package barista;

import org.apache.commons.lang3.StringUtils;
import java.util.Arrays;
import java.util.stream.Collectors;

public class QueryBuilder {
    private static final String[] DEFAULT_COLUMNS = {"Search_Parameters"};

    public static String buildSQLQuery(String keyword) {
        return buildQuery(keyword, DEFAULT_COLUMNS, "=", false, 0, -1);
    }

    public static String buildSPARQLQuery(String sparqlquery) {
        return buildQuery(sparqlquery, DEFAULT_COLUMNS, "=", false, 0, -1);
    }


    public static boolean isSparqlQuery(String query) {
        if (query == null || query.isEmpty()) {
            return false;
        }

        String queryLower = query.trim().toLowerCase();
        return queryLower.startsWith("select") || queryLower.startsWith("prefix") || queryLower.startsWith("ask") ||
                queryLower.startsWith("construct") || queryLower.startsWith("describe") ||
                queryLower.startsWith("insert") || queryLower.startsWith("delete");
    }

    public static String buildQuery (String q, String[] columns, String operator, boolean caseInsensitive, int offset, int limit)
    {
        String searchOperator = getSearchOperator(operator);
        String searchColumns = getSearchColumns(columns);
        String searchKeyword = caseInsensitive ? q.toLowerCase() : q;
        String escapedKeyword = escapeKeyword(searchKeyword);

        StringBuilder query = new StringBuilder();

        if (isSparqlQuery(q)) {
            query.append("SELECT * FROM LTSOLID_SPARQL WHERE 1=1 -- SPARQL Query: \n-- ")
             .append(q.replace("\n", "\n-- "));
        }

        else{

        query.append("SELECT * FROM LTSOLID WHERE ")
           .append(DEFAULT_COLUMNS[0])
           .append(searchOperator);

           if (searchOperator.trim().equals("LIKE")) {
               query.append(" '%").append(escapedKeyword).append("%'");
           }
           else{
               query.append(" '").append(escapedKeyword).append("'");
           }

        if (offset > 0 && limit > 0) {
            query.append(" LIMIT ").append(offset).append(", ").append(limit);
        }

        query.append(" ORDER BY RELEVANCE DESC");

        }

        System.out.println(">>>>> "+query);
        return query.toString();

    }



    public static String buildSqlQuery_OLD(String keyword, String[] columns, String operator, boolean caseInsensitive, int offset, int limit) {
        String searchOperator = getSearchOperator(operator);
        String searchColumns = getSearchColumns(columns);
        String searchKeyword = caseInsensitive ? keyword.toLowerCase() : keyword;
        String escapedKeyword = escapeKeyword(searchKeyword);

        StringBuilder sql = new StringBuilder();

        // To test this with mysql use solidtbl instead of LTSOLID
        sql.append("SELECT * FROM LTSOLID_SPARQL WHERE ")
           .append(DEFAULT_COLUMNS[0])
           .append(searchOperator);

           if (searchOperator.trim().equals("LIKE")) {
               sql.append(" '%").append(escapedKeyword).append("%'");
           }
           else{
               sql.append(" '").append(escapedKeyword).append("'");
           }

        if (offset > 0 && limit > 0) {
            sql.append(" LIMIT ").append(offset).append(", ").append(limit);
        }

//        sql.append(" ORDER BY RELEVANCE DESC");

        System.out.println(">>>>> "+sql);
        return sql.toString();
    }

    private static String getSearchOperator(String operator) {
        switch (operator.toUpperCase()) {
            case "LIKE":
                return " LIKE ";
            case "=":
                return " = ";
            case "<":
                return " < ";
            case ">":
                return " > ";
            default:
                throw new IllegalArgumentException("Invalid search operator: " + operator);
        }
    }

    private static String getSearchColumns(String[] columns) {
        if (columns == null || columns.length == 0) {
            columns = DEFAULT_COLUMNS;
        }
        return Arrays.stream(columns)
                     .map(column -> "LOWER(" + column + ")")
                     .collect(Collectors.joining(" OR ", "(", ")"));
    }

    private static String escapeKeyword(String keyword) {
        // Replace single quotes with two single quotes to escape them
        return StringUtils.replace(keyword, "'", "''");
    }


}
