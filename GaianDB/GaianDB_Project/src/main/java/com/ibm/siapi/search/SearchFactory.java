package com.ibm.siapi.search;

import com.ibm.siapi.common.ApplicationInfo;

/**
 * @author Reza Moosaei 27.02.23 17:45
 */
public class SearchFactory {

    public static ApplicationInfo createApplicationInfo(Object inputOne) {
        return new ApplicationInfo();
    }
    public static Query createQuery(Object inputOne) {
        return new Query();
    }
    public static SearchService getSearchService(Object inputOne) {
        return new SearchService();
    }
}
