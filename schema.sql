-- 1. Table `profils` (Users/Staff)
CREATE TABLE public.profils (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nom TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Personnel')) DEFAULT 'Personnel',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profils
ALTER TABLE public.profils ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profils FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profils FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Table `produits` (Inventory)
CREATE TABLE public.produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    description TEXT,
    prix_achat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    prix_vente NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock_actuel INTEGER NOT NULL DEFAULT 0,
    seuil_alerte INTEGER NOT NULL DEFAULT 5,
    categorie TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for produits
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Produits are viewable by everyone." ON public.produits FOR SELECT USING (true);
CREATE POLICY "Only admins/personnel can modify produits." ON public.produits FOR ALL USING (auth.role() = 'authenticated');


-- 3. Table `ventes` (Sales headers)
CREATE TABLE public.ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_vente TIMESTAMPTZ DEFAULT now(),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    methode_paiement TEXT CHECK (methode_paiement IN ('Espèces', 'Carte', 'Virement')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ventes
ALTER TABLE public.ventes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ventes viewable by authenticated users." ON public.ventes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create ventes." ON public.ventes FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 4. Table `ligne_ventes` (Sale items)
CREATE TABLE public.ligne_ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vente_id UUID REFERENCES public.ventes(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES public.produits(id) ON DELETE SET NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ligne_ventes
ALTER TABLE public.ligne_ventes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ligne ventes viewable by authenticated users." ON public.ligne_ventes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create ligne ventes." ON public.ligne_ventes FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Helper Function: Decrease stock upon sale insertion (Trigger)
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.produits
    SET stock_actuel = stock_actuel - NEW.quantite
    WHERE id = NEW.produit_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER decrement_stock_trigger
AFTER INSERT ON public.ligne_ventes
FOR EACH ROW EXECUTE FUNCTION decrement_stock();
