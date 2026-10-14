-- Migration 004: Create Food Menus, Preferences, Complaint Categories, and System Settings
-- Core food management and foundation seeds

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_menus (
    id SERIAL PRIMARY KEY,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_day_meal UNIQUE (day_of_week, meal_type)
);

CREATE TABLE IF NOT EXISTS meal_preferences (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
    selected_option_id VARCHAR(100) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_meal_date UNIQUE (student_id, meal_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_pref_date_meal ON meal_preferences(meal_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_pref_student ON meal_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_food_menu_day ON food_menus(day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_complaint_cat_dept ON complaint_categories(department);
