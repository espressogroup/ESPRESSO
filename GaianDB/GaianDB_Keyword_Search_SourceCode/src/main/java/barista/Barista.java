package barista;
import java.sql.*;
import java.util.Scanner;

public class Barista {
    private static final String DB_URL = "jdbc:mysql://localhost/soliddb";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "engmohamed";

    public static void main(String[] args) {
        System.out.println("Barista..");
        try (Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             Statement statement = connection.createStatement()) {

            String keyword = promptKeyword();
            String[] columns = promptColumns();
            String operator = promptOperator();
            boolean caseInsensitive = promptCaseInsensitive();
            int offset = promptOffset();
            int limit = promptLimit();


            String sqlQuery = QueryBuilder.buildSqlQuery_OLD(keyword, columns, operator, caseInsensitive, offset, limit);
            System.out.println("Executing SQL query: " + sqlQuery);

            ResultSet resultSet = statement.executeQuery(sqlQuery);
            while (resultSet.next()) {
                // Process the search results here
                String column1Value = resultSet.getString("address");
                System.out.println(column1Value);
                String column2Value = resultSet.getString("relevancy");
                System.out.println(column2Value);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

 private static String promptKeyword() {
        // Prompt the user to enter a keyword to search for
        System.out.print("Enter keyword: ");
        Scanner scanner = new Scanner(System.in);
        return scanner.nextLine();
    }

    private static String[] promptColumns() {
        // Prompt the user to enter the columns to search in
        System.out.print("Enter columns to search in (comma-separated, leave blank for default): ");
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        if (input.isEmpty()) {
            return null;
        }
        return input.split(",");
    }

    private static String promptOperator() {
        // Prompt the user to enter the search operator to use
        System.out.print("Enter search operator (LIKE, =, <, or >): ");
        Scanner scanner = new Scanner(System.in);
        return scanner.nextLine();
    }

    private static boolean promptCaseInsensitive() {
        // Prompt the user to choose whether the search should be case-insensitive
        System.out.print("Should search be case-insensitive (y/n)? ");
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        return input.equalsIgnoreCase("y");
    }

    private static int promptOffset() {
        // Prompt the user to enter the result offset
        System.out.print("Enter result offset (leave blank for no offset): ");
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        if (input.isEmpty()) {
            return 0;
        }
        return Integer.parseInt(input);
    }

    private static int promptLimit() {
        // Prompt the user to enter the maximum number of results to return
        System.out.print("Enter maximum number of results to return (leave blank for no limit): ");
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        if (input.isEmpty()) {
            return -1;
        }
        return Integer.parseInt(input);
    }



}

