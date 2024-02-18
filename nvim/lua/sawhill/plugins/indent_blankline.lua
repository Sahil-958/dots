return {
    -- Add indentation guides even on blank lines
    'lukas-reineke/indent-blankline.nvim',
    -- See `:help ibl`
    main = 'ibl',
    opts = {},
    config = function()
        vim.defer_fn(
            function()
                local config = {
                    enabled = true,
                    debounce = 200,
                    viewport_buffer = {
                        min = 30,
                        max = 500,
                    },
                    indent = {
                        char = "│",
                        -- tab_char = { "a", "b", "c" },
                        tab_char = "",
                        highlight = "IblIndent",
                        smart_indent_cap = true,
                        priority = 1,
                        repeat_linebreak = true,
                    },
                    whitespace = {
                        highlight = { "Function", "Label" },
                        remove_blankline_trail = true,
                    },
                    scope = {
                        enabled = true,
                        char = "|",
                        show_start = true,
                        show_end = true,
                        show_exact_scope = true,
                        injected_languages = true,
                        highlight = { "Function", "Label" },
                        priority = 1024,
                        include = {
                            node_type = {},
                        },
                        exclude = {
                            language = {},
                            node_type = {
                                ["*"] = {
                                    "source_file",
                                    "program",
                                },
                                lua = {
                                    "chunk",
                                },
                                python = {
                                    "module",
                                },
                            },
                        },
                    },
                    exclude = {
                        filetypes = {
                            "lspinfo",
                            "packer",
                            "checkhealth",
                            "help",
                            "man",
                            "gitcommit",
                            "TelescopePrompt",
                            "TelescopeResults",
                            "dashboard",
                            "",
                        },
                        buftypes = {
                            "terminal",
                            "nofile",
                            "quickfix",
                            "prompt",
                        },
                    },
                }
                -- Call the setup function with the configuration
                require("ibl").setup(config)
            end, 0)
    end
}
