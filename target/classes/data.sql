-- 插入管理员用户 (密码: Sym666666!)
INSERT INTO users (username, password, role, real_name, enabled)
SELECT 'admin', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'ADMIN', '系统管理员', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- 插入经理用户 (密码: manager123)
INSERT INTO users (username, password, role, real_name, enabled)
SELECT 'manager', '$2a$10$3Qj6ldf7.7VT8YhNUXtKBOT0s4.G.ATvP0S.1EaJuGNB7Jv.PPqX2', 'MANAGER', '经理', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

-- 插入员工用户 (密码: staff123)
INSERT INTO users (username, password, role, real_name, enabled)
SELECT 'staff', '$2a$10$YK2IZjkWGSB2M8yKk.9Xn.kZwZOZF5G3HX8fs4eCbzRHmB3RQB1.q', 'STAFF', '员工', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'staff');

-- 初始化用户数据
INSERT INTO users (username, password, role, real_name, email, phone, enabled)
SELECT 'admin', '$2a$10$YK2IZjkWGSB2M8yKk.9Xn.kZwZOZF5G3HX8fs4eCbzRHmB3RQB1.q', 'ADMIN', '系统管理员', 'admin@example.com', '13800000000', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, role, real_name, email, phone, enabled)
SELECT 'manager', '$2a$10$3Qj6ldf7.7VT8YhNUXtKBOT0s4.G.ATvP0S.1EaJuGNB7Jv.PPqX2', 'MANAGER', '经理', 'manager@example.com', '13800000001', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

INSERT INTO users (username, password, role, real_name, email, phone, enabled)
SELECT 'staff', '$2a$10$YK2IZjkWGSB2M8yKk.9Xn.kZwZOZF5G3HX8fs4eCbzRHmB3RQB1.q', 'STAFF', '员工', 'staff@example.com', '13800000002', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'staff'); 