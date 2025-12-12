BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "ProductBatches" (
	"id"	INTEGER,
	"batch_number"	VARCHAR(255),
	"expiry"	DATETIME,
	"barcode"	VARCHAR(255),
	"product"	INTEGER,
	"purchase_code"	VARCHAR(255),
	"createdAt"	DATETIME,
	"updatedAt"	DATETIME,
	"quantity"	DOUBLE PRECISION,
	"quantity_sold"	DOUBLE PRECISION DEFAULT '0',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
	"name"	VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("name")
);
CREATE TABLE IF NOT EXISTS "_customers_old" (
	"id"	integer,
	"first_name"	text NOT NULL,
	"last_name"	text NOT NULL,
	"sex"	text DEFAULT NULL,
	"nationality"	text DEFAULT NULL,
	"phone"	text NOT NULL,
	"email"	text DEFAULT NULL,
	"place_of_work"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"picture"	text DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "active_ingredients" (
	"id"	integer,
	"name"	text NOT NULL,
	"indication"	text DEFAULT null,
	"side_effect"	text DEFAULT null,
	"caution"	text DEFAULT null,
	"pregnancy"	text DEFAULT null,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "activities" (
	"activity_id"	integer,
	"user_id"	integer NOT NULL DEFAULT 0,
	"activity"	text NOT NULL,
	"module"	text NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"deleted"	integer NOT NULL DEFAULT 0,
	PRIMARY KEY("activity_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "branches" (
	"id"	integer,
	"name"	text NOT NULL,
	"location"	text DEFAULT NULL,
	"phone"	text NOT NULL,
	"address"	text DEFAULT NULL,
	"email"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "customer_diagnostics" (
	"id"	integer,
	"customer"	integer NOT NULL,
	"test"	text NOT NULL,
	"data"	text NOT NULL,
	"comments"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("customer") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "customers" (
	"id"	integer,
	"name"	text NOT NULL,
	"sex"	text DEFAULT NULL,
	"phone"	text DEFAULT NULL,
	"email"	text DEFAULT NULL,
	"location"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"date_of_birth"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "dailyRecords" (
	"id"	INTEGER,
	"date"	DATETIME,
	"amount"	DOUBLE PRECISION,
	"shift"	VARCHAR(255),
	"created_by"	INTEGER,
	"created_on"	DATETIME,
	"cash"	DOUBLE PRECISION DEFAULT '0',
	"momo"	DOUBLE PRECISION DEFAULT '0',
	"insurance"	DOUBLE PRECISION DEFAULT '0',
	"credit"	DOUBLE PRECISION DEFAULT '0',
	"pos"	DOUBLE PRECISION DEFAULT '0',
	"cheque"	DOUBLE PRECISION DEFAULT '0',
	"other"	DOUBLE PRECISION DEFAULT '0',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "db_sync" (
	"id"	integer,
	"type"	text NOT NULL,
	"action"	text DEFAULT null,
	"data"	text DEFAULT null,
	"created_on"	text DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "dbbackups" (
	"id"	integer,
	"file_name"	text NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	text DEFAULT NULL,
	"description"	text DEFUALT,
	"uploaded"	text DEFAULT null,
	"db_version"	text DEFAULT null,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "diagnostic_tests" (
	"id"	integer,
	"test_name"	text NOT NULL,
	"parameters"	text NOT NULL,
	"comments"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "drug_info" (
	"id"	integer,
	"name"	text NOT NULL,
	"pregnancy"	text DEFAULT null,
	"pharmacodynamics"	text DEFAULT null,
	"mechanism_of_action"	text DEFAULT null,
	"pharmacokinetics"	text DEFAULT null,
	"indications_and_usage"	text DEFAULT null,
	"contraindications"	text DEFAULT null,
	"drug_interactions_table"	text DEFAULT null,
	"warnings_and_cautions"	text DEFAULT null,
	"dosage_and_administration"	text DEFAULT null,
	"adverse_reactions"	text DEFAULT null,
	"information_for_patients"	text DEFAULT null,
	"clinical_pharmacology"	text DEFAULT null,
	"drug_abuse_and_dependence"	text DEFAULT null,
	"teratogenic_effects"	text DEFAULT null,
	"geriatric_use"	text DEFAULT null,
	"overdosage"	text DEFAULT null,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "incoming_payments" (
	"id"	integer,
	"date"	text NOT NULL,
	"amount"	text NOT NULL,
	"type"	text NOT NULL,
	"payer"	text NOT NULL,
	"payment_method"	text DEFAULT 'CASH',
	"transaction_id"	text DEFAULT null,
	"item_code"	text DEFAULT null,
	"notes"	text DEFAULT null,
	"created_by"	integer DEFAULT null,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "insurance_providers" (
	"id"	integer,
	"name"	text NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id"	INTEGER,
	"date"	DATETIME,
	"transaction_type"	VARCHAR(255),
	"reference_id"	VARCHAR(255),
	"product"	INTEGER,
	"quantity"	DOUBLE PRECISION,
	"previous_stock"	DOUBLE PRECISION,
	"current_stock"	DOUBLE PRECISION,
	"created_by"	VARCHAR(255),
	"created_on"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "inventory_transactions_product_products_fk" FOREIGN KEY("product") REFERENCES "products"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS "item_active_ingredients" (
	"id"	integer,
	"product"	integer NOT NULL,
	"ingredient"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("ingredient") REFERENCES "active_ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "online_backups" (
	"id"	integer,
	"date"	text NOT NULL UNIQUE,
	"url"	text NOT NULL,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "outgoing_payments" (
	"id"	integer,
	"date"	text NOT NULL,
	"amount"	text NOT NULL,
	"type"	text NOT NULL,
	"recipient"	text NOT NULL,
	"payment_method"	text DEFAULT 'CASH',
	"transaction_id"	text DEFAULT null,
	"item_code"	text DEFAULT null,
	"notes"	text DEFAULT null,
	"created_by"	integer DEFAULT null,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "permissions" (
	"permission_id"	integer,
	"name"	text NOT NULL,
	"description"	text NOT NULL,
	PRIMARY KEY("permission_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "products" (
	"id"	integer,
	"name"	text NOT NULL,
	"price"	real NOT NULL,
	"category"	text NOT NULL DEFAULT 'Uncategorised',
	"notes"	text DEFAULT NULL,
	"unit"	text DEFAULT NULL,
	"picture"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"max_stock"	real DEFAULT NULL,
	"min_stock"	real NOT NULL DEFAULT 1,
	"expiry"	text DEFAULT NULL,
	"barcode"	text DEFAULT NULL,
	"current_stock"	real DEFAULT NULL,
	"last_modified"	text DEFAULT NULL,
	"cost_price"	real DEFAULT null,
	"size"	text DEFAULT null,
	"description"	text DEFAULT null,
	"status"	integer DEFAULT null,
	"shelf"	text DEFAULT null,
	"preferred_vendor"	INTEGER,
	"is_drug"	VARCHAR(255) DEFAULT 'yes',
	"generic_name"	VARCHAR(255) DEFAULT NULL,
	"contraindications"	VARCHAR(255) DEFAULT NULL,
	"pregnancy"	VARCHAR(255) DEFAULT NULL,
	"side_effects"	VARCHAR(255) DEFAULT NULL,
	"caution"	VARCHAR(255) DEFAULT NULL,
	"indications"	VARCHAR(255) DEFAULT NULL,
	"markup"	DOUBLE PRECISION DEFAULT '1.33',
	"active_ingredients"	VARCHAR(255) DEFAULT NULL,
	"drug_info"	VARCHAR(255) DEFAULT NULL,
	"last_stock_modification"	VARCHAR(255) DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "purchase_details" (
	"id"	integer,
	"product"	integer NOT NULL,
	"quantity"	real NOT NULL,
	"price"	real NOT NULL,
	"unit"	text NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer NOT NULL,
	"markup"	real NOT NULL,
	"code"	varchar(50) NOT NULL,
	"date"	text DEFAULT NULL,
	"selling_price"	real NOT NULL,
	"expiry"	VARCHAR(255) DEFAULT NULL,
	"updateProduct"	VARCHAR(255) DEFAULT 'yes',
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("code") REFERENCES "purchases"("code") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "purchases" (
	"id"	INTEGER NOT NULL,
	"vendor"	integer NOT NULL,
	"date"	text NOT NULL,
	"site"	text DEFAULT NULL,
	"code"	text NOT NULL,
	"status"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer DEFAULT NULL,
	"invoice"	text DEFAULT NULL,
	"payment_method"	text DEFAULT null,
	"amount_paid"	real DEFAULT null,
	"last_payment_date"	text DEFAULT null,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("vendor") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "received_transfer_details" (
	"id"	integer,
	"product"	integer NOT NULL,
	"quantity"	real NOT NULL,
	"price"	real NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer NOT NULL,
	"code"	text NOT NULL,
	"date"	text DEFAULT NULL,
	"expiry"	text DEFAULT NULL,
	"cost_price"	real NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("code") REFERENCES "received_transfers"("code") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "received_transfers" (
	"id"	INTEGER NOT NULL,
	"date"	text NOT NULL,
	"code"	text NOT NULL,
	"invoice"	text NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer DEFAULT NULL,
	"sender"	integer DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("sender") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "refills" (
	"id"	integer,
	"product"	text NOT NULL,
	"product_id"	integer DEFAULT NULL,
	"quantity"	text NOT NULL,
	"start_date"	date NOT NULL,
	"end_date"	date DEFAULT NULL,
	"created_by"	integer DEFAULT NULL,
	"status"	text DEFAULT NULL,
	"customer_id"	integer DEFAULT null,
	"customer_name"	text DEFAULT null,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "reminders" (
	"id"	INTEGER,
	"type"	VARCHAR(255) NOT NULL,
	"dayOfWeek"	VARCHAR(255) NOT NULL DEFAULT 'Monday',
	"hourOfDay"	VARCHAR(255) NOT NULL DEFAULT '9',
	"recipient"	VARCHAR(255) NOT NULL,
	"cc"	VARCHAR(255) NOT NULL DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "requisition_details" (
	"id"	INTEGER,
	"product"	INTEGER,
	"code"	VARCHAR(255),
	"price"	DOUBLE PRECISION,
	"cost_price"	DOUBLE PRECISION,
	"quantity"	DOUBLE PRECISION,
	"expiry"	DATETIME,
	"created_on"	DATETIME,
	"date"	DATETIME NOT NULL,
	"created_by"	INTEGER DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "requisition_details_code_key" FOREIGN KEY("code") REFERENCES "requisitions"("code") ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT "requisition_details_product_key" FOREIGN KEY("product") REFERENCES "products"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "requisitions" (
	"id"	INTEGER,
	"code"	VARCHAR(255) NOT NULL,
	"sender"	INTEGER NOT NULL,
	"recipient"	INTEGER NOT NULL,
	"created_on"	DATETIME,
	"created_by"	INTEGER DEFAULT NULL,
	"status"	VARCHAR(255) NOT NULL DEFAULT 'Pending',
	CONSTRAINT "requisitions_code_key" UNIQUE("code"),
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "requisitions_store_recipient" FOREIGN KEY("recipient") REFERENCES "stores"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT "requisitions_store_sender" FOREIGN KEY("sender") REFERENCES "stores"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id"	integer,
	"role_id"	integer NOT NULL,
	"permission_id"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "roles" (
	"role_id"	integer,
	"role_name"	text NOT NULL,
	"description"	text DEFAULT NULL,
	PRIMARY KEY("role_id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "sales" (
	"id"	integer,
	"customer"	text DEFAULT NULL,
	"code"	text NOT NULL,
	"created_by"	integer NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"date"	text NOT NULL,
	"amount_paid"	real NOT NULL DEFAULT 0,
	"payment_method"	text NOT NULL DEFAULT 'Cash',
	"momo_reference"	text DEFAULT NULL,
	"insurance_provider"	text DEFAULT NULL,
	"insurance_member_name"	text DEFAULT NULL,
	"insurance_member_id"	text DEFAULT NULL,
	"creditor_name"	text DEFAULT NULL,
	"credit_paid"	integer NOT NULL DEFAULT 0,
	"discount"	real NOT NULL DEFAULT 0,
	"shift"	text DEFAULT null,
	"tax"	DOUBLE PRECISION DEFAULT '0',
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("insurance_provider") REFERENCES "insurance_providers"("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "sales_batches" (
	"id"	INTEGER,
	"date"	DATETIME,
	"batch_number"	VARCHAR(255),
	"product"	INTEGER,
	"quantity"	DOUBLE PRECISION,
	"code"	VARCHAR(255),
	"created_by"	INTEGER,
	"created_on"	DATETIME,
	"expiry"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "sales_details" (
	"id"	integer,
	"date"	text NOT NULL,
	"product"	integer NOT NULL,
	"price"	real NOT NULL,
	"quantity"	real NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"code"	text NOT NULL,
	"cost_price"	real DEFAULT NULL,
	"expiry"	VARCHAR(255) DEFAULT NULL,
	"unit"	VARCHAR(255) DEFAULT NULL,
	"label"	VARCHAR(255) DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("code") REFERENCES "sales"("code") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "sales_payment_methods" (
	"id"	INTEGER,
	"code"	VARCHAR(255) NOT NULL,
	"payment_method"	VARCHAR(255) NOT NULL,
	"created_on"	DATETIME,
	"date"	DATETIME DEFAULT NULL,
	"amount_paid"	DOUBLE PRECISION NOT NULL,
	"transaction_id"	VARCHAR(255) DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "settings" (
	"id"	integer,
	"name"	text NOT NULL,
	"module"	text NOT NULL,
	"value"	text NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "stock_adjustment" (
	"id"	integer,
	"date"	text NOT NULL,
	"product"	integer NOT NULL,
	"quantity_counted"	real NOT NULL,
	"quantity_expected"	real NOT NULL,
	"current_price"	real DEFAULT NULL,
	"created_by"	integer DEFAULT NULL,
	"code"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"cost_price"	real DEFAULT NULL,
	"category"	text DEFAULT NULL,
	"size"	text DEFAULT NULL,
	"expiry"	text DEFAULT NULL,
	"comments"	text DEFAULT NULL,
	"quantity_expired"	real NOT NULL DEFAULT 0,
	"quantity_damaged"	real NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "stock_adjustment_pending" (
	"id"	integer,
	"date"	text NOT NULL,
	"product"	integer NOT NULL,
	"quantity_counted"	real NOT NULL,
	"quantity_expected"	real NOT NULL,
	"current_price"	real DEFAULT NULL,
	"created_by"	integer DEFAULT NULL,
	"code"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"cost_price"	real DEFAULT NULL,
	"category"	text DEFAULT NULL,
	"size"	text DEFAULT NULL,
	"expiry"	text DEFAULT NULL,
	"comments"	text DEFAULT NULL,
	"quantity_expired"	real NOT NULL DEFAULT 0,
	"quantity_damaged"	real NOT NULL DEFAULT 0,
	"shelf"	text DEFAULT NULL,
	"unit"	text DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "stock_adjustment_sessions" (
	"id"	integer,
	"date"	text NOT NULL,
	"code"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer DEFAULT NULL,
	"status"	text DEFAULT 'in_progress',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "stock_values" (
	"id"	integer,
	"date"	text NOT NULL UNIQUE,
	"last_modified"	text DEFAULT current_timestamp,
	"selling_value"	real NOT NULL,
	"cost_value"	date NOT NULL,
	"created_on"	date DEFAULT current_timestamp,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "store_inventory" (
	"id"	INTEGER,
	"product"	INTEGER,
	"store"	INTEGER,
	"max_stock"	DOUBLE PRECISION,
	"min_stock"	DOUBLE PRECISION,
	"current_stock"	DOUBLE PRECISION,
	"expiry"	DATETIME,
	"created_on"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT),
	CONSTRAINT "products_storeInventory_product" FOREIGN KEY("product") REFERENCES "products"("id") ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT "products_storeInventory_store" FOREIGN KEY("store") REFERENCES "stores"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "stores" (
	"id"	INTEGER,
	"name"	VARCHAR(255),
	"created_on"	DATETIME,
	"description"	VARCHAR(255) DEFAULT '',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tokens" (
	"id"	INTEGER,
	"name"	VARCHAR(255),
	"token"	VARCHAR(255),
	"created_on"	DATETIME,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "transfer_details" (
	"id"	integer,
	"product"	integer NOT NULL,
	"quantity"	real NOT NULL,
	"price"	real NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer NOT NULL,
	"code"	text NOT NULL,
	"date"	text DEFAULT NULL,
	"expiry"	text DEFAULT NULL,
	"cost_price"	real NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("code") REFERENCES "transfers"("code") ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY("product") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "transfers" (
	"id"	integer,
	"receiver"	integer NOT NULL,
	"date"	text NOT NULL,
	"code"	text DEFAULT NULL,
	"status"	text DEFAULT 'Pending',
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"created_by"	integer DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("receiver") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id"	integer,
	"user_id"	integer NOT NULL,
	"token"	text NOT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"expires"	text NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	integer,
	"role_id"	integer NOT NULL,
	"email"	text NOT NULL,
	"username"	text NOT NULL DEFAULT '',
	"password_hash"	text DEFAULT NULL,
	"last_login"	text NOT NULL DEFAULT '0000-00-00 00:00:00',
	"last_ip"	text NOT NULL DEFAULT '',
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"display_name"	text DEFAULT '',
	"active"	integer NOT NULL DEFAULT 0,
	"last_seen"	text DEFAULT NULL,
	"phone"	text DEFAULT NULL,
	"allow_online"	VARCHAR(255) DEFAULT 'no',
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "vendors" (
	"id"	integer,
	"name"	text NOT NULL,
	"location"	text DEFAULT NULL,
	"phone"	text NOT NULL,
	"code"	text DEFAULT NULL,
	"email"	text DEFAULT NULL,
	"notes"	text DEFAULT NULL,
	"created_on"	text DEFAULT CURRENT_TIMESTAMP,
	"legacy_id"	integer DEFAULT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE INDEX IF NOT EXISTS "ai_index" ON "active_ingredients" (
	"indication",
	"side_effect",
	"caution",
	"pregnancy"
);
CREATE UNIQUE INDEX IF NOT EXISTS "ai_name_unique" ON "active_ingredients" (
	"name"
);
CREATE UNIQUE INDEX IF NOT EXISTS "branches_unique_name" ON "branches" (
	"name"
);
CREATE INDEX IF NOT EXISTS "customer_diagnostics_test" ON "customer_diagnostics" (
	"test"
);
CREATE INDEX IF NOT EXISTS "dbbackups_name" ON "dbbackups" (
	"file_name",
	"created_on",
	"description",
	"uploaded",
	"db_version"
);
CREATE UNIQUE INDEX IF NOT EXISTS "insurance_providers_name_unique" ON "insurance_providers" (
	"name"
);
CREATE INDEX IF NOT EXISTS "item_ai_index" ON "item_active_ingredients" (
	"product",
	"ingredient"
);
CREATE INDEX IF NOT EXISTS "product_index" ON "products" (
	"price",
	"category",
	"max_stock",
	"min_stock",
	"expiry",
	"current_stock",
	"last_modified",
	"status"
);
CREATE INDEX IF NOT EXISTS "purchaseDetails_index_code" ON "purchase_details" (
	"code"
);
CREATE INDEX IF NOT EXISTS "purchase_details_index_1" ON "purchase_details" (
	"created_on",
	"date"
);
CREATE INDEX IF NOT EXISTS "purchases_index_1" ON "purchases" (
	"vendor",
	"date",
	"created_on",
	"invoice",
	"payment_method",
	"last_payment_date",
	"status"
);
CREATE UNIQUE INDEX IF NOT EXISTS "purchases_index_2" ON "purchases" (
	"code"
);
CREATE INDEX IF NOT EXISTS "received_transfer_details_index_1" ON "received_transfer_details" (
	"created_on",
	"date"
);
CREATE INDEX IF NOT EXISTS "received_transfers_index_1" ON "received_transfers" (
	"created_on",
	"date"
);
CREATE UNIQUE INDEX IF NOT EXISTS "received_transfers_index_2" ON "received_transfers" (
	"code"
);
CREATE INDEX IF NOT EXISTS "receivedtransferDetails_index_code" ON "received_transfer_details" (
	"code"
);
CREATE INDEX IF NOT EXISTS "sales_index_1" ON "sales" (
	"created_on",
	"date",
	"payment_method",
	"insurance_member_id",
	"insurance_member_name"
);
CREATE UNIQUE INDEX IF NOT EXISTS "sales_index_2" ON "sales" (
	"code"
);
CREATE INDEX IF NOT EXISTS "sales_payment_methods_amount_paid" ON "sales_payment_methods" (
	"amount_paid"
);
CREATE INDEX IF NOT EXISTS "sales_payment_methods_created_on" ON "sales_payment_methods" (
	"created_on"
);
CREATE INDEX IF NOT EXISTS "sales_payment_methods_date" ON "sales_payment_methods" (
	"date"
);
CREATE INDEX IF NOT EXISTS "sales_payment_methods_payment_method" ON "sales_payment_methods" (
	"payment_method"
);
CREATE UNIQUE INDEX IF NOT EXISTS "settings_index_1" ON "settings" (
	"name"
);
CREATE UNIQUE INDEX IF NOT EXISTS "stock_index_1" ON "stock_adjustment_sessions" (
	"code"
);
CREATE INDEX IF NOT EXISTS "stock_index_2" ON "stock_adjustment_sessions" (
	"date"
);
CREATE INDEX IF NOT EXISTS "transferDetails_index_code" ON "transfer_details" (
	"code"
);
CREATE INDEX IF NOT EXISTS "transferdetails_index_1" ON "transfer_details" (
	"date",
	"created_on",
	"product",
	"quantity",
	"expiry"
);
CREATE INDEX IF NOT EXISTS "transfers_index_1" ON "transfers" (
	"date",
	"created_on"
);
CREATE UNIQUE INDEX IF NOT EXISTS "transfers_index_2" ON "transfers" (
	"code"
);
CREATE INDEX IF NOT EXISTS "users_index_1" ON "users" (
	"username",
	"active"
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_index_2" ON "users" (
	"email"
);
CREATE INDEX IF NOT EXISTS "users_sess_index_1" ON "user_sessions" (
	"token",
	"user_id",
	"expires"
);
CREATE UNIQUE INDEX IF NOT EXISTS "vendors_unique_name" ON "vendors" (
	"name"
);
CREATE TRIGGER after_sale_details_insert
AFTER INSERT ON sales_details
FOR EACH ROW
BEGIN
    -- Get the current stock before update
    UPDATE products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;

    -- Record the transaction
    INSERT INTO inventory_transactions (
        product_id,
        transaction_type,
        reference_id,
        quantity_change,
        previous_stock,
        current_stock
    )
    VALUES (
        NEW.product_id,
        'SALE',
        NEW.id,
        -NEW.quantity,
        (SELECT current_stock FROM products WHERE id = NEW.product_id) + NEW.quantity,
        (SELECT current_stock FROM products WHERE id = NEW.product_id)
    );
END;
COMMIT;
