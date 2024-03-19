-- Crear la tabla accounts
CREATE TABLE accounts (
                          id SERIAL PRIMARY KEY,
                          dni text,
                          name text,
                          address text,
                          owner_id UUID NOT NULL REFERENCES auth.users(id),
                          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          active_from TIMESTAMP WITH TIME ZONE,
                          active_until TIMESTAMP WITH TIME ZONE,
                          status text
);

-- Crear índice para la columna owner_id en la tabla accounts
CREATE INDEX idx_accounts_owner_id ON accounts(owner_id);

-- Crear la tabla payments
CREATE TABLE payments (
                          id SERIAL PRIMARY KEY,
                          account_id INT REFERENCES accounts(id),
                          payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                          months_paid INT,
                          amount DECIMAL(10, 2)
);

-- Crear índice para la columna account_id en la tabla payments
CREATE INDEX idx_payments_account_id ON payments(account_id);

-- Crear la tabla user_additional_info
CREATE TABLE user_additional_info (
                                      user_id UUID PRIMARY KEY REFERENCES auth.users(id),
                                      name TEXT,
                                      roles TEXT[],
                                      owner UUID REFERENCES auth.users(id)
);
-- Crear la política "user_and_owner_can_modify"
CREATE POLICY user_and_owner_can_modify ON user_additional_info
FOR UPDATE
               USING (
               auth.uid() = user_id OR
               auth.uid() = owner
               );

CREATE VIEW public.users AS SELECT * FROM auth.users;
GRANT SELECT ON public.users TO authenticated;
