return {
    'nvimdev/dashboard-nvim',
    event = 'VimEnter',
    config = function()
        require('dashboard').setup {
            theme = 'hyper',
            config = {
                header = {
                    [[                                                                       ]],
                    [[                                                                     ]],
                    [[       ████ ██████           █████      ██                     ]],
                    [[      ███████████             █████                             ]],
                    [[      █████████ ███████████████████ ███   ███████████   ]],
                    [[     █████████  ███    █████████████ █████ ██████████████   ]],
                    [[    █████████ ██████████ █████████ █████ █████ ████ █████   ]],
                    [[  ███████████ ███    ███ █████████ █████ █████ ████ █████  ]],
                    [[ ██████  █████████████████████ ████ █████ █████ ████ ██████ ]],
                    [[                                                                       ]],
                }, --your header
                week_header = {
                    enable = false,
                },
                mru = {
                    limit = 5,
                    --icon = ' ',
                    --label = '',
                    --cwd_only = false
                },
                project = {
                    enable = true,
                    limit = 4,
                    --icon = 'your icon',
                    --label = '',
                    action = 'Telescope find_files cwd='
                },
                shortcut = {
                    { desc = '󰊳 Update', group = '@property', action = 'Lazy update', key = 'u' },
                    { desc = ' Sync', group = '@property', action = 'Lazy sync', key = 'u' },
                    {
                        icon = '󰱼 ',
                        icon_hl = '@variable',
                        desc = 'Files',
                        group = 'Label',
                        action = 'Telescope find_files',
                        key = 'f',
                    },
                    --[[
                    {
                        desc = ' Apps',
                        group = 'DiagnosticHint',
                        action = 'Telescope app',
                        key = 'a',
                    },
                    {
                        desc = ' dotfiles',
                        group = 'Number',
                        action = 'Telescope dotfiles',
                        key = 'd',
                    },
                    ]]      --
                },
                footer = {} --your footer
            }
        }
    end,
    dependencies = { { 'nvim-tree/nvim-web-devicons' } }
}
