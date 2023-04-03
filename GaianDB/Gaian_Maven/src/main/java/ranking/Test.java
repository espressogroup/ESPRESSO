package ranking;

import barista.QueryBuilder;
import com.ibm.gaiandb.webservices.ws.PostRestWS;
import com.ibm.solid.SolidServiceCall;
import com.ibm.solid.SqlParser;

import java.util.Map;

public class Test {

    public static void main(String[] args) throws Exception {

        String sql_kw = QueryBuilder.buildSqlQuery("Latte");
        System.out.println(sql_kw);

    }
}
