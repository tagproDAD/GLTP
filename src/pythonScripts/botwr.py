import io, csv, requests, json, sys, argparse, re

def clean_map_name(name):
    # Find the *last* ' by ' and remove everything after it
    parts = name.rsplit(" by ", 1)
    if len(parts) == 2 and len(parts[1]) <= 100:
        return parts[0]
    return name

def get_details(replay):
    assert replay[0][1] == "recorder-metadata"
    assert replay[2][1] == "map"
    assert replay[3][1] == "clientInfo"
    metadata = replay[0][2]
    map_data = replay[2][2]
    try:
        map_id = replay[3][2]["mapfile"].split("/")[1] if replay[3][2]["mapfile"] else None
    except IndexError:
        map_id = None

    spreadsheet_maps = [m for m in get_maps() if m["map_id"] == map_id]
    assert len(spreadsheet_maps) in (0, 1)

    # check equivalent maps if no matches
    if not spreadsheet_maps:
        spreadsheet_maps = [m for m in get_maps() if str(map_id) in m["equivalent_map_ids"]]

    if spreadsheet_maps:
        if spreadsheet_maps[0].get("caps_to_win") == 'pups':
            caps_to_win = float("inf")
        else:
            caps_to_win = int(spreadsheet_maps[0].get("caps_to_win") or 1)
        effective_map_id = spreadsheet_maps[0]["map_id"]
        allow_blue_caps = bool(spreadsheet_maps[0]["allow_blue_caps"])
    else:
        caps_to_win = 1
        effective_map_id = map_id
        allow_blue_caps = False

    first_timer_ts = [r for r in replay if r[1] == 'time'][0][2]["time"]

    players = {
        p["id"]: {"name": p["displayName"], "user_id": p["userId"], "is_red": p["team"] == 1}
        for p in metadata["players"]
    }

    def get_run_details():
        for cap_time, _, caps in [r for r in replay if r[1] == 'p']:
            for cap_details in caps:
                if cap_details.get('s-captures') != caps_to_win:
                    continue
                capping_player_in_game_id = cap_details["id"]
                capping_player = players[capping_player_in_game_id]
                if not (capping_player["is_red"] or allow_blue_caps):
                    continue
                record_time = cap_time - first_timer_ts
                capping_user_name, capping_user_id = capping_player["name"], capping_player["user_id"]
                capping_player_msgs = [r for r in replay if r[1] == 'chat' and r[2].get('from') == capping_player_in_game_id]
                capping_player_quote = capping_player_msgs[-1][2]["message"] if capping_player_msgs else None
                return record_time, capping_user_name, capping_user_id, capping_player_quote
        return None, None, None, None

    record_time, capping_user_name, capping_user_id, capping_player_quote = get_run_details()

    return {
        "map_id": effective_map_id,
        "actual_map_id": map_id,
        "preset": None,  # TODO
        "map_name": map_data["info"]["name"],
        "map_author": map_data["info"]["author"],
        "players": list(players.values()),
        "capping_player": capping_user_name,
        "capping_player_user_id": capping_user_id,
        "record_time": format_ms(record_time),
        "is_solo": len(players) == 1,
        "timestamp": metadata["started"],
        "uuid": metadata['uuid'],
        "caps_to_win": caps_to_win,
        "capping_player_quote": capping_player_quote
    }

def format_ms(milliseconds):
    minutes = milliseconds // 60000
    seconds = (milliseconds % 60000) / 1000
    return f"{minutes}:{seconds:06.3f}"


def get_maps():
    response = requests.get(
        "https://docs.google.com/spreadsheets/d/1OnuTCekHKCD91W39jXBG4uveTCCyMxf9Ofead43MMCU/export",
        params={
            "format": "csv",
            'id': '1OnuTCekHKCD91W39jXBG4uveTCCyMxf9Ofead43MMCU',
            'gid': '1775606307',
        }
    )
    csv_file = io.StringIO(response.text, newline="")
    map_data = [
        {
            "name": conf["Map / Player"],
            "preset": conf["Group Preset"],
            "difficulty": conf["Final Rating"],
            "fun": conf["Final Fun \nRating"],
            "category": conf["Category"],
            "map_id": conf["Map ID"],
            "equivalent_map_ids": conf["Pseudo \nMap ID"].split(","),
            "caps_to_win": conf["Num\nof caps"],
            "allow_blue_caps": conf["Allow Blue Caps"].strip() == "TRUE",
            "balls_req": conf["Min\nBalls \nRec"],
            "max_balls_rec": conf["Max\nBalls\nRec"]
        }
        for conf in csv.DictReader(csv_file)
        if conf["Group Preset"].strip()
    ]
    illegal_maps = [
        m for m in map_data if
        not m["preset"].strip() or
        not m["map_id"] or
        inject_map_id_into_preset(m["preset"], m["map_id"]) != m["preset"]
    ]
    return [m for m in map_data if m["map_id"] not in [im["map_id"] for im in illegal_maps]]


def inject_map_id_into_preset(preset, map_id):
    digits = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    n = int(map_id)
    enc = digits[0] if n == 0 else ""
    while n:
        n, r = divmod(n, 52)
        enc = digits[r] + enc
    inner = "f" + enc
    inj = "M" + digits[len(inner)] + inner
    pos = preset.find("M")
    if pos == -1:
        return preset
    old_len = digits.index(preset[pos + 1])
    return preset[:pos] + inj + preset[pos + 2 + old_len:]


def get_replay_data(uuid):
    response = requests.get(
        "https://tagpro.koalabeast.com/replays/data",
        params={"uuid": uuid}
    )
    if response.status_code == 429:
        raise RuntimeError
    try:
        data = response.json()
    except requests.exceptions.JSONDecodeError:
        raise RuntimeError
    if len(data["games"]) != 1:
        return None
    response = requests.get(
        "https://tagpro.koalabeast.com/replays/gameFile",
        params={"gameId": data["games"][0]["id"]}
    )
    return [json.loads(line) for line in response.text.splitlines()]


def get_summary(replay):
    # Very basic example, just shows map name and number of players
    assert replay[0][1] == "recorder-metadata"
    metadata = replay[0][2]
    map_name = replay[2][2]["info"]["name"]
    num_players = len(metadata["players"])
    return {
        "map_name": map_name,
        "num_players": num_players,
        "timestamp": metadata["started"],
        "uuid": metadata["uuid"]
    }

def make_map_json(output_file="presets.json"):
    maps = get_maps()
    output = {
        clean_map_name(m["name"]): m["preset"]
        for m in maps
    }
    with open(output_file, "w") as f:
        json.dump(output, f, indent=4)
    print(f"Saved {len(output)} map presets to {output_file}")


def main():
    parser = argparse.ArgumentParser(description="Replay Analysis Tool")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Subcommand: parse
    parse_parser = subparsers.add_parser("parse", help="Parse full replay details")
    parse_parser.add_argument("uuid", help="Replay UUID")

    # Subcommand: summary
    summary_parser = subparsers.add_parser("summary", help="Get quick replay summary")
    summary_parser.add_argument("uuid", help="Replay UUID")

    # Subcommand: populate json
    populate_parser = subparsers.add_parser("presets", help="Update presets file from spreadsheet")

    args = parser.parse_args()

    if args.command == "parse":
        replay_data = get_replay_data(args.uuid)
        details = get_details(replay_data)
        print(json.dumps(details, indent=4))

    elif args.command == "summary":
        replay_data = get_replay_data(args.uuid)
        summary = get_summary(replay_data)
        print(json.dumps(summary, indent=4))

    elif args.command == "presets":
        make_map_json()
        print("json updated")

if __name__ == "__main__":
    main()
