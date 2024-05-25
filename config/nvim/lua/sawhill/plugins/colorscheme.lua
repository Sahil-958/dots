return {
    {
        "folke/tokyonight.nvim",
        enabled = false,
        lazy = false,    -- make sure we load this during startup if it is your main colorscheme
        priority = 1000, -- make sure to load this before all the other start plugins
        config = function()
            -- load the colorscheme here
            vim.cmd([[colorscheme tokyonight]])
            vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
            vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })
        end,
    },
    {
        "oncomouse/lushwal.nvim",
        lazy = false,
        enabled = true,
        cmd = { "LushwalCompile" },
        dependencies = {
            { "rktjmp/lush.nvim" },
            { "rktjmp/shipwright.nvim" },
        },
        config = function()
            vim.g.lushwal_configuration = {
                color_overrides = function(colors)
                    local overrides = {
                        grey = colors.color8.mix(colors.color7, 30),                   -- Darker mid-grey
                        br_grey = colors.color8.mix(colors.color7, 65),                -- Mid-grey
                        orange = colors.color1.mix(colors.color3, 50),
                        purple = colors.color4.rotate(65).li(45),                      -- Purple
                        pink = colors.color4.rotate(65).li(45).mix(colors.color5, 50), -- Pink
                        amaranth = colors.color1.mix(colors.color4, 34).saturate(46).darken(5),
                        brown = colors.color1.mix(colors.color5, 15),                  -- Brown
                    }
                    return vim.tbl_extend("force", colors, overrides)
                end,
                compile_to_vimscript = false,
                addons = {
                    ale = true,
                    barbar = true,
                    bufferline_nvim = true,
                    coc_nvim = true,
                    dashboard_nvim = true,
                    fern_vim = true,
                    gina = true,
                    gitsigns_nvim = true,
                    hop_nvim = true,
                    hydra_nvim = true,
                    indent_blankline_nvim = true,
                    lightspeed_nvim = true,
                    lspsaga_nvim = true,
                    lsp_trouble_nvim = true,
                    lualine = true,
                    markdown = true,
                    mini_nvim = true,
                    native_lsp = true,
                    neogit = true,
                    neomake = true,
                    nerdtree = true,
                    nvim_cmp = true,
                    nvim_tree_lua = true,
                    nvim_ts_rainbow = true,
                    semshi = true,
                    telescope_nvim = true,
                    treesitter = true,
                    vim_dirvish = true,
                    vim_gitgutter = true,
                    vim_signify = true,
                    vim_sneak = true,
                    which_key_nvim = true,
                }
            }
            vim.api.nvim_command("colorscheme lushwal")
            --vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
            --vim.api.nvim_set_hl(0, "FloatBorder", { bg = "none" })
            --vim.api.nvim_set_hl(0, "WhichKeyFloat", { bg = "none" })
            --vim.api.nvim_set_hl(0, "LineNr", { bg = "none" })
            --vim.api.nvim_set_hl(0, "Pmenu", { bg = "none" })
            --vim.api.nvim_set_hl(0, "Conceal", { bg = "none" })
            --vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })
        end,
    },
}
