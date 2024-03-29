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
}