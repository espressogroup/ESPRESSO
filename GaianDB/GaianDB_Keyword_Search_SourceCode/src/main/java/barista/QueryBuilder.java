package barista;

import org.apache.commons.lang3.StringUtils;
import java.util.Arrays;
import java.util.stream.Collectors;

public class QueryBuilder {
    private static final String[] DEFAULT_COLUMNS = {"Search_Parameters"};

    public static String buildSqlQuery(String keyword) {
        return buildSqlQuery(keyword, DEFAULT_COLUMNS, "=", false, 0, -1);
    }

    public static String buildSqlQuery(String keyword, String[] columns, String operator, boolean caseInsensitive, int offset, int limit) {
        String searchOperator = getSearchOperator(operator);
        String searchColumns = getSearchColumns(columns);
        String searchKeyword = caseInsensitive ? keyword.toLowerCase() : keyword;
        String escapedKeyword = escapeKeyword(searchKeyword);

        StringBuilder sql = new StringBuilder();

        // To test this with mysql use solidtbl instead of LTSOLID
        sql.append("SELECT * FROM LTSOLID WHERE ")
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

        sql.append(" ORDER BY RELEVANCE DESC");

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
