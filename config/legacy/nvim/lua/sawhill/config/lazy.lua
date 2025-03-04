local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
    vim.fn.system({
        "git",
        "clone",
        "--filter=blob:none",
        "https://github.com/folke/lazy.nvim.git",
        "--branch=stable", -- latest stable release
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

--require("lazy").setup(plugins, opts)
require("lazy").setup(
    "sawhill.plugins",
    {
        ui = {
            -- a number <1 is a percentage., >1 is a fixed size
            size = { width = 0.8, height = 0.8 },
            wrap = true, -- wrap the lines in the ui
            -- The border to use for the UI window. Accepts same border values as |nvim_open_win()|.
            border = "double",
            title = "Package Management", ---@type string only works when border is not "none"
            title_pos = "center", ---@type "center" | "left" | "right"
            -- Show pills on top of the Lazy window
            pills = true, ---@type boolean
        },
        custom_keys = {
            -- You can define custom key maps here. If present, the description will
            -- be shown in the help menu.
            -- To disable one of the defaults, set it to false.
            vim.keymap.set("n", "<leader>ls", "<cmd>Lazy<cr>", { desc = "Lazy" }),
       }
    }
)
