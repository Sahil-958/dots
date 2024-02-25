return {
    {
        'VonHeikemen/lsp-zero.nvim',
        branch = 'v3.x',
        lazy = true,
        config = false,
        init = function()
            -- Disable automatic setup, we are doing it manually
            vim.g.lsp_zero_extend_cmp = 0
            vim.g.lsp_zero_extend_lspconfig = 0
        end,
    },
    {
        'williamboman/mason.nvim',
        lazy = false,
        config = function()
            require('mason').setup({
                ui = {
                    ---@since 1.0.0
                    -- Whether to automatically check for new versions when opening the :Mason window.
                    check_outdated_packages_on_open = true,

                    ---@since 1.0.0
                    -- The border to use for the UI window. Accepts same border values as |nvim_open_win()|.
                    border = "double",

                    ---@since 1.0.0
                    -- Width of the window. Accepts:
                    -- - Integer greater than 1 for fixed width.
                    -- - Float in the range of 0-1 for a percentage of screen width.
                    width = 0.8,

                    ---@since 1.0.0
                    -- Height of the window. Accepts:
                    -- - Integer greater than 1 for fixed height.
                    -- - Float in the range of 0-1 for a percentage of screen height.
                    height = 0.9,
                },
            })
        end,
    },

    -- Autocompletion
    {
        'hrsh7th/nvim-cmp',
        event = 'InsertEnter',
        dependencies = {
            { 'L3MON4D3/LuaSnip' },
        },
        config = function()
            -- Here is where you configure the autocompletion settings.
            local lsp_zero = require('lsp-zero')
            lsp_zero.extend_cmp()

            -- And you can configure cmp even more, if you want to.
            local cmp = require('cmp')
            local cmp_action = lsp_zero.cmp_action()

            cmp.setup({
                preselect = 'item',
                completion = {
                    completeopt = 'menu,menuone,noinsert'
                },
                --formatting = lsp_zero.cmp_format(),
                formatting = {
                    -- changing the order of fields so the icon is the first
                    fields = { 'menu', 'abbr', 'kind' },

                    -- here is where the change happens
                    format = function(entry, item)
                        local menu_icon = {
                            nvim_lsp = 'λ',
                            luasnip = '⋗',
                            buffer = 'Ω',
                            path = '🖫',
                            nvim_lua = 'Π',
                        }

                        item.menu = menu_icon[entry.source.name]
                        return item
                    end,
                },
                mapping = {
                    ['<C-Space>'] = cmp.mapping.complete(),
                    ['<C-p>'] = cmp.mapping.select_prev_item({ behavior = 'select' }),
                    ['<C-n>'] = cmp.mapping.select_next_item({ behavior = 'select' }),
                    ['<C-y>'] = cmp.mapping.confirm({ select = true }),
                    ['<CR>'] = cmp.mapping.confirm({ select = true }),
                    ['<C-u>'] = cmp.mapping.scroll_docs(-4),
                    ['<C-d>'] = cmp.mapping.scroll_docs(4),
                    ['<C-f>'] = cmp_action.luasnip_jump_forward(),
                    ['<C-b>'] = cmp_action.luasnip_jump_backward(),
                    ['<Tab>'] = cmp.mapping(function()
                        if cmp.visible() then
                            cmp.select_next_item({ behavior = 'select' })
                            --cmp_action.tab_complete()
                        else
                            local tabstop = vim.api.nvim_get_option('tabstop')
                            vim.cmd("normal! i" .. string.rep(" ", tabstop))
                        end
                    end),
                    ['<S-Tab>'] = cmp_action.select_prev_or_fallback(),
                },
                window = {
                    completion = cmp.config.window.bordered(),
                    documentation = cmp.config.window.bordered(),
                }
            })
        end
    },

    -- LSP
    {
        'neovim/nvim-lspconfig',
        cmd = { 'LspInfo', 'LspInstall', 'LspStart' },
        event = { 'BufReadPre', 'BufNewFile' },
        dependencies = {
            { 'hrsh7th/cmp-nvim-lsp' },
            { 'williamboman/mason-lspconfig.nvim' },
        },
        config = function()
            -- This is where all the LSP shenanigans will live
            local lsp_zero = require('lsp-zero')
            lsp_zero.extend_lspconfig()

            --- if you want to know more about lsp-zero and mason.nvim
            --- read this: https://github.com/VonHeikemen/lsp-zero.nvim/blob/v3.x/doc/md/guides/integrate-with-mason-nvim.md
            lsp_zero.on_attach(function(client, bufnr)
                -- see :help lsp-zero-keybindings
                -- to learn the available actions
                local opts = { buffer = bufnr, remap = false }
                lsp_zero.default_keymaps({ buffer = bufnr })
                vim.keymap.set("n", "<leader>lf", function() vim.lsp.buf.format() end, opts) --<leader>f is used for local format using conform plugin so using lf for format
                vim.keymap.set("n", "<leader>qf", function() vim.lsp.buf.code_action() end, opts)
                --[[
                    DEFAULTS
                    K:
                    Displays hover information about the symbol under the cursor in a floating window. See |vim.lsp.buf.hover()|.

                    gd:
                    Jumps to the definition of the symbol under the cursor. See |vim.lsp.buf.definition()|.

                    gD:
                    Jumps to the declaration of the symbol under the cursor. Some servers don't implement this feature. See |vim.lsp.buf.declaration()|.

                    gi:
                    Lists all the implementations for the symbol under the cursor in the quickfix window. See |vim.lsp.buf.implementation()|.

                    go:
                    Jumps to the definition of the type of the symbol under the cursor. See |vim.lsp.buf.type_definition()|.

                    gr:
                    Lists all the references to the symbol under the cursor in the quickfix window. See |vim.lsp.buf.references()|.

                    gs:
                    Displays signature information about the symbol under the cursor in a floating window. See |vim.lsp.buf.signature_help()|. If a mapping already exists for this key this function is not bound.

                    <F2>:
                    Renames all references to the symbol under the cursor. See |vim.lsp.buf.rename()|.

                    <F3>:
                    Format a buffer using the LSP servers attached to it. See |vim.lsp.buf.format()|.

                    <F4>:
                    Selects a code action available at the current cursor position. See |vim.lsp.buf.code_action()|.

                    gl:
                    Show diagnostic in a floating window. See |vim.diagnostic.open_float()|.

                    [d:
                    Move to the previous diagnostic in the current buffer. See |vim.diagnostic.goto_prev()|.

                    ]d:
                    Move to the next diagnostic. See |vim.diagnostic.goto_next()|.

                ]]
                --
            end)

            require('mason-lspconfig').setup({
                ensure_installed = {},
                handlers = {
                    lsp_zero.default_setup,
                    lua_ls = function()
                        -- (Optional) Configure lua language server for neovim
                        local lua_opts = lsp_zero.nvim_lua_ls()
                        require('lspconfig').lua_ls.setup(lua_opts)
                    end,
                }
            })
        end
    }
}
