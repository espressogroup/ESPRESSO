package com.ibm.gaiandb.apps.dashboard;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.sql.Connection;

import javax.swing.*;

//import com.ibm.gaiandb.security.client.JavaAuth;
//import com.ibm.gaiandb.security.common.KerberosToken;
//import com.ibm.security.auth.callback.Krb5CallbackHandler;
//
//import javax.security.auth.kerberos.KerberosTicket;


public class AboutTab extends Tab{

	final JPanel pane = new JPanel();
	final JPanel connectionPanel = new JPanel(new GridBagLayout());

	private static final int STRING_FIELDS_WIDTH = 25;
	private final JLabel title;

	private final JLabel appinfo;


    public AboutTab(Dashboard container) {
        super(container);

        Insets padding = new Insets(Dashboard.BORDER_SIZE, 0, 0, Dashboard.BORDER_SIZE);

        pane.setLayout(new BoxLayout(pane, BoxLayout.PAGE_AXIS));


		GridBagConstraints fieldConstraints = new GridBagConstraints();
		fieldConstraints.anchor = GridBagConstraints.LINE_START;
		fieldConstraints.gridx = 2;
		fieldConstraints.gridwidth = 2;
		fieldConstraints.insets = padding;


		JPanel infoPane = new JPanel();
		infoPane.setMinimumSize(new Dimension(0, 32));

		title = new JLabel("Barista APP V1.0   ");

		appinfo= new JLabel(" From ESPRESSO Efficient Search over Personal Repositories - Secure and Sovereign Project");
		infoPane.add(title);
		infoPane.add(appinfo);;

		pane.add(infoPane);

        add(pane, BorderLayout.CENTER);


    }



    @Override
    public void connected(Connection newConn) {

    }

    @Override
    public void disconnected() {

    }

    @Override
    public void activated() {

    }

    @Override
    public void deactivated() {

    }

}
