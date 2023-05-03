package org.espresso.barista.querylogic;

import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.stream.Collectors;

public class QueryBuilder {
    private static final String[] DEFAULT_COLUMNS = {"term"};

    public static String buildSqlQuery(String keyword) {
        return buildSqlQuery(keyword, DEFAULT_COLUMNS, "LIKE", true, 0, -1);
    }

    public static String buildSqlQuery(String keyword, String[] columns, String operator, boolean caseInsensitive, int offset, int limit) {
        String searchOperator = getSearchOperator(operator);
        String searchColumns = getSearchColumns(columns);
        String searchKeyword = caseInsensitive ? keyword.toLowerCase() : keyword;
        String escapedKeyword = escapeKeyword(searchKeyword);

        StringBuilder sql = new StringBuilder();

        sql.append("SELECT * FROM Keyword WHERE ")
           .append(searchColumns)
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
