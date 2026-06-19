import csv
import random
import os
from datetime import datetime, timedelta

random.seed(42)

DATA_DIR = r'd:\proje\label-109\public\data'
os.makedirs(DATA_DIR, exist_ok=True)

# ============ 1. menu_items.csv ============
cocktail_names = [
    "莫吉托", "长岛冰茶", "玛格丽特", "大都会", "曼哈顿",
    "血腥玛丽", "代基里", "迈泰", "新加坡司令", "威士忌酸",
    "莫斯科骡子", "内格罗尼", "old fashioned", "边车", "汤姆柯林斯",
    "白兰地亚历山大", "蓝色夏威夷", "椰林飘香", "莫西多", "性感海滩"
]

whiskey_names_cup = [
    "麦卡伦12年(杯)", "山崎12年(杯)", "白州12年(杯)", "格兰菲迪15年(杯)",
    "尊尼获加黑牌(杯)", "杰克丹尼(杯)", "百龄坛特醇(杯)", "格兰杰10年(杯)"
]

whiskey_names_bottle = [
    "麦卡伦18年", "山崎18年"
]

beer_names = [
    "IPA精酿", "小麦白啤", "世涛黑啤", "拉格啤酒",
    "比利时修道院", "酸啤", "琥珀艾尔", "新英格兰IPA"
]

wine_names = [
    "拉菲传奇波尔多", "奔富BIN 389", "张裕解百纳", "长城五星",
    "法国勃艮第黑皮诺", "意大利基安蒂", "智利佳美娜", "澳洲西拉"
]

other_liquor = [
    "轩尼诗XO", "人头马VSOP", "马爹利蓝带", "绝对伏特加",
    "百加得朗姆酒", "孟买蓝宝石金酒", "君度橙酒", "野格利口酒",
    "可口可乐", "苏打水", "汤力水", "红牛",
    "鲜榨橙汁", "椰子水"
]

menu_items = []
item_id = 1

for name in cocktail_names:
    sale_price = random.randint(68, 168)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, "鸡尾酒",
        random.choice(["经典鸡尾酒", "创意鸡尾酒", "果味鸡尾酒"]),
        "杯", sale_price, cost_price, 1
    ])
    item_id += 1

for name in whiskey_names_cup:
    sale_price = random.randint(58, 388)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, "威士忌",
        random.choice(["单一麦芽", "调和威士忌", "波本"]),
        "杯", sale_price, cost_price, 0
    ])
    item_id += 1

for name in whiskey_names_bottle:
    sale_price = random.randint(1280, 3880)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, "威士忌",
        random.choice(["单一麦芽", "调和威士忌"]),
        "瓶", sale_price, cost_price, 0
    ])
    item_id += 1

for name in beer_names:
    sale_price = random.randint(38, 88)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, "精酿啤酒",
        random.choice(["IPA", "小麦", "世涛", "拉格"]),
        random.choice(["杯", "杯", "杯", "瓶"]),
        sale_price, cost_price, 0
    ])
    item_id += 1

for name in wine_names:
    sale_price = random.randint(198, 1280)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, "红酒",
        random.choice(["干红", "半干红", "桃红"]),
        "瓶", sale_price, cost_price, 0
    ])
    item_id += 1

for i, name in enumerate(other_liquor):
    if i < 8:
        category = "洋酒"
        sub_category = random.choice(["白兰地", "伏特加", "朗姆酒", "金酒", "利口酒"])
        unit = random.choice(["杯", "瓶"])
        if unit == "瓶":
            sale_price = random.randint(288, 1680)
        else:
            sale_price = random.randint(48, 188)
    else:
        category = "软饮"
        sub_category = random.choice(["碳酸饮料", "果汁", "功能饮料", "水"])
        unit = random.choice(["杯", "瓶"])
        sale_price = random.randint(18, 58)
    cost_price = round(sale_price * random.uniform(0.25, 0.35), 2)
    menu_items.append([
        f"ITEM{item_id:03d}", name, category, sub_category, unit,
        sale_price, cost_price, 0
    ])
    item_id += 1

with open(os.path.join(DATA_DIR, 'menu_items.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['item_id', 'name', 'category', 'sub_category', 'unit', 'sale_price', 'cost_price', 'is_cocktail'])
    writer.writerows(menu_items)

print(f"menu_items.csv: {len(menu_items)} 条记录")

# ============ 2. employees.csv ============
bartender_names = [
    "张伟", "李娜", "王强", "刘芳", "陈磊", "杨静"
]
waiter_names = [
    "赵鹏", "孙丽", "周杰", "吴敏", "郑涛", "王雪",
    "冯超", "陈燕", "褚明", "卫华", "蒋琳", "沈宇",
    "韩梅", "林涛"
]

employees = []
emp_id = 1

for name in bartender_names:
    employees.append([f"EMP{emp_id:03d}", name, "调酒师", name[0]])
    emp_id += 1

for name in waiter_names:
    employees.append([f"EMP{emp_id:03d}", name, "服务员", name[0]])
    emp_id += 1

with open(os.path.join(DATA_DIR, 'employees.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['employee_id', 'name', 'role', 'avatar'])
    writer.writerows(employees)

print(f"employees.csv: {len(employees)} 条记录")

# ============ 3. customers.csv ============
def generate_customer_name(gender):
    surnames = ["张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴",
                "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"]
    male_names = ["伟", "强", "磊", "洋", "勇", "军", "杰", "涛", "明", "超",
                  "鹏", "华", "辉", "宇", "浩", "凯", "健", "俊", "帆", "博"]
    female_names = ["静", "丽", "敏", "芳", "娜", "燕", "艳", "莉", "娟", "雪",
                    "琳", "霞", "婷", "慧", "莹", "颖", "佳", "悦", "璐", "瑶"]
    surname = random.choice(surnames)
    if gender == "男":
        given = random.choice(male_names)
        if random.random() < 0.4:
            given += random.choice(male_names)
    else:
        given = random.choice(female_names)
        if random.random() < 0.4:
            given += random.choice(female_names)
    return surname + given

def generate_age():
    r = random.random()
    if r < 0.65:
        return random.randint(18, 34)
    else:
        return random.randint(35, 65)

def generate_membership():
    r = random.random()
    if r < 0.6:
        return "普通"
    elif r < 0.85:
        return "银卡"
    elif r < 0.97:
        return "金卡"
    else:
        return "钻石"

def generate_visits():
    r = random.random()
    if r < 0.4:
        return 1
    elif r < 0.75:
        return random.randint(2, 5)
    elif r < 0.9:
        return random.randint(6, 10)
    else:
        return random.randint(11, 50)

membership_multiplier = {"普通": 1.0, "银卡": 1.5, "金卡": 2.2, "钻石": 3.5}
avg_spend_per_visit = {"普通": 250, "银卡": 380, "金卡": 550, "钻石": 900}

customers = []
today = datetime.now()

for cus_id in range(1, 501):
    gender = random.choice(["男", "女"])
    age = generate_age()
    membership = generate_membership()
    total_visits = generate_visits()
    
    days_ago = random.randint(1, 365)
    first_visit = today - timedelta(days=days_ago)
    
    base_spend = avg_spend_per_visit[membership] * total_visits
    variation = random.uniform(0.7, 1.4)
    age_factor = 1.0 if age < 35 else 0.85
    total_spent = round(base_spend * variation * age_factor, 2)
    
    customers.append([
        f"CUS{cus_id:03d}",
        generate_customer_name(gender),
        age, gender, membership,
        first_visit.strftime("%Y-%m-%d"),
        total_visits, total_spent
    ])

with open(os.path.join(DATA_DIR, 'customers.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['customer_id', 'name', 'age', 'gender', 'membership_level', 'first_visit_date', 'total_visits', 'total_spent'])
    writer.writerows(customers)

print(f"customers.csv: {len(customers)} 条记录")

# ============ 4. tables_usage.csv ============
bartender_ids = [e[0] for e in employees if e[2] == "调酒师"]
waiter_ids = [e[0] for e in employees if e[2] == "服务员"]
customer_ids = [c[0] for c in customers]

tables = []
table_id_counter = 1

for i in range(1, 11):
    tables.append((f"TBL{table_id_counter:03d}", "吧台", random.choice([1, 2])))
    table_id_counter += 1

for i in range(1, 16):
    tables.append((f"TBL{table_id_counter:03d}", "卡座", random.choice([4, 5, 6])))
    table_id_counter += 1

for i in range(1, 6):
    tables.append((f"TBL{table_id_counter:03d}", "包间", random.choice([8, 10, 12])))
    table_id_counter += 1

tables_usage = []
usage_id = 1

for day_offset in range(7):
    current_date = today - timedelta(days=day_offset)
    
    for table_id, table_type, capacity in tables:
        if table_type == "吧台":
            turns = random.randint(3, 6)
        elif table_type == "卡座":
            turns = random.choice([1, 2, 2, 3])
        else:
            turns = random.choice([0, 1])
        
        if turns == 0:
            continue
        
        last_close_hour = 21
        for turn in range(turns):
            base_hour = max(last_close_hour + random.randint(0, 1), 21)
            if base_hour > 23:
                break
            
            open_hour = base_hour
            open_minute = random.choice([0, 15, 30, 45])
            open_time = current_date.replace(hour=open_hour, minute=open_minute, second=0, microsecond=0)
            
            duration_hours = random.uniform(1, 5)
            if table_type == "吧台":
                duration_hours = random.uniform(0.5, 2)
            elif table_type == "卡座":
                duration_hours = random.uniform(1.5, 3.5)
            else:
                duration_hours = random.uniform(2.5, 5)
            
            close_time = open_time + timedelta(hours=duration_hours)
            if close_time.hour > 3 and close_time.day == current_date.day + 1:
                close_time = close_time.replace(day=current_date.day, hour=3, minute=0)
            
            last_close_hour = close_time.hour if close_time.day == current_date.day else 24
            
            if table_type == "吧台":
                guest_count = random.randint(1, min(capacity, 4))
                per_person = random.uniform(150, 300)
            elif table_type == "卡座":
                guest_count = random.randint(2, capacity)
                per_person = random.uniform(200, 400)
            else:
                guest_count = random.randint(4, capacity)
                per_person = random.uniform(300, 600)
            
            total_consumption = round(guest_count * per_person, 2)
            customer_id = random.choice(customer_ids) if random.random() < 0.7 else ""
            
            tables_usage.append([
                f"USE{usage_id:04d}",
                table_id, table_type, capacity,
                open_time.strftime("%Y-%m-%d %H:%M:%S"),
                close_time.strftime("%Y-%m-%d %H:%M:%S"),
                guest_count, total_consumption, customer_id
            ])
            usage_id += 1

with open(os.path.join(DATA_DIR, 'tables_usage.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['usage_id', 'table_id', 'table_type', 'capacity', 'open_time', 'close_time', 'guest_count', 'total_consumption', 'customer_id'])
    writer.writerows(tables_usage)

print(f"tables_usage.csv: {len(tables_usage)} 条记录")

# ============ 5. sales_records.csv ============
menu_item_map = {item[0]: item for item in menu_items}
table_usage_map = {}
for usage in tables_usage:
    tid = usage[1]
    if tid not in table_usage_map:
        table_usage_map[tid] = []
    table_usage_map[tid].append(usage)

sales_records = []
sale_id = 1

target_records = 2000
records_per_usage = max(1, target_records // len(tables_usage) + 2)

for usage in tables_usage:
    usage_id, table_id, table_type, capacity, open_time_str, close_time_str, guest_count, total_consumption, customer_id = usage
    open_time = datetime.strptime(open_time_str, "%Y-%m-%d %H:%M:%S")
    close_time = datetime.strptime(close_time_str, "%Y-%m-%d %H:%M:%S")
    
    if table_type == "吧台":
        num_items = random.randint(max(4, guest_count), max(10, guest_count * 5))
    elif table_type == "卡座":
        num_items = random.randint(max(6, guest_count * 2), max(15, guest_count * 6))
    else:
        num_items = random.randint(max(10, guest_count * 3), max(25, guest_count * 5))
    
    running_total = 0
    
    for i in range(num_items):
        if random.random() < 0.15 and table_type != "吧台":
            candidates = [item for item in menu_items if item[3] in ["干红", "半干红", "桃红"] or item[5] > 500]
        elif table_type == "吧台":
            candidates = [item for item in menu_items if item[4] == "杯" and item[5] < 300]
        else:
            candidates = menu_items
        
        if not candidates:
            candidates = menu_items
        
        item = random.choice(candidates)
        item_id = item[0]
        unit_price = item[5]
        quantity = random.randint(1, 3)
        if item[4] == "瓶":
            quantity = random.choice([1, 1, 1, 2])
        
        total_amount = round(quantity * unit_price, 2)
        
        if running_total + total_amount > total_consumption * 5.0 and i > 3:
            continue
        running_total += total_amount
        
        total_minutes = int((close_time - open_time).total_seconds() / 60)
        if total_minutes <= 0:
            continue
        
        peak_start_min = max(0, (23 - open_time.hour) * 60 - open_time.minute)
        peak_end_min = (25 - open_time.hour) * 60 - open_time.minute
        
        use_peak = random.random() < 0.6 and peak_start_min < total_minutes
        if use_peak:
            effective_peak_end = min(peak_end_min, total_minutes)
            if effective_peak_end > peak_start_min:
                sale_offset = random.randint(peak_start_min, effective_peak_end)
            else:
                sale_offset = random.randint(0, total_minutes)
        else:
            sale_offset = random.randint(0, total_minutes)
        
        sale_time = open_time + timedelta(minutes=sale_offset)
        
        if sale_time > close_time:
            sale_time = close_time - timedelta(minutes=random.randint(5, 30))
        
        bartender_id = random.choice(bartender_ids) if item[7] == 1 or item[2] in ["威士忌", "洋酒"] else random.choice(bartender_ids)
        waiter_id = random.choice(waiter_ids)
        
        if random.random() < 0.65:
            tip_amount = round(total_amount * random.uniform(0.05, 0.15), 2)
        else:
            tip_amount = 0.0
        
        sales_records.append([
            f"SALE{sale_id:05d}",
            sale_time.strftime("%Y-%m-%d %H:%M:%S"),
            table_id,
            customer_id if customer_id else random.choice([""] + customer_ids[:50]),
            item_id,
            quantity, unit_price, total_amount,
            bartender_id, waiter_id, tip_amount
        ])
        sale_id += 1

with open(os.path.join(DATA_DIR, 'sales_records.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['sale_id', 'sale_time', 'table_id', 'customer_id', 'item_id', 'quantity', 'unit_price', 'total_amount', 'bartender_id', 'waiter_id', 'tip_amount'])
    writer.writerows(sales_records)

print(f"sales_records.csv: {len(sales_records)} 条记录")
print("\n所有数据文件生成完成！")
