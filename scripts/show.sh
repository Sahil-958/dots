sudo ./showmethekey-cli | jq '.key_name | sub("^KEY_"; "") | capture("^(?<key_part>.*)") | .key_part' -r

